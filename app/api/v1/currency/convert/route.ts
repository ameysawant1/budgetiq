import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../../../lib/mongodb';
import { verifyToken } from '../../../../../lib/auth';

interface Conversion {
  _id: ObjectId;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  description: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const db = await getDb();
    const collection = db.collection('currency_conversions');

    const conversions = await collection.find({ userId }).sort({ createdAt: -1 }).limit(50).toArray() as Conversion[];

    return NextResponse.json({
      success: true,
      data: {
        conversions: conversions.map(conversion => ({
          id: conversion._id.toString(),
          fromAccountId: conversion.fromAccountId,
          toAccountId: conversion.toAccountId,
          fromCurrency: conversion.fromCurrency,
          toCurrency: conversion.toCurrency,
          fromAmount: conversion.fromAmount,
          toAmount: conversion.toAmount,
          exchangeRate: conversion.exchangeRate,
          description: conversion.description,
          createdAt: conversion.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ success: false, error: { code: 'unauthorized', message: 'Invalid token' } }, { status: 401 });

    const userId = payload.sub;

    const body = await request.json();
    const { fromAccountId, toAccountId, fromAmount, exchangeRate, description } = body;

    if (!fromAccountId || !toAccountId || !fromAmount || !exchangeRate) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Missing required fields' } }, { status: 400 });
    }

    const db = await getDb();
    const accountsCollection = db.collection('currency_accounts');
    const conversionsCollection = db.collection('currency_conversions');

    // Validate ObjectIds
    let fromObjectId, toObjectId;
    try {
      fromObjectId = new ObjectId(fromAccountId);
      toObjectId = new ObjectId(toAccountId);
    } catch (error) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid account ID format' } }, { status: 400 });
    }

    // Get account details
    const fromAccount = await accountsCollection.findOne({ _id: fromObjectId, userId });
    const toAccount = await accountsCollection.findOne({ _id: toObjectId, userId });

    if (!fromAccount || !toAccount) {
      return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Account not found' } }, { status: 404 });
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Cannot convert to the same account' } }, { status: 400 });
    }

    const amount = parseFloat(fromAmount);
    const rate = parseFloat(exchangeRate);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid conversion amount' } }, { status: 400 });
    }

    if (isNaN(rate) || rate <= 0) {
      return NextResponse.json({ success: false, error: { code: 'validation_failed', message: 'Invalid exchange rate' } }, { status: 400 });
    }

    const toAmount = amount * rate;

    // Check if from account has sufficient balance
    if (fromAccount.balance < amount) {
      return NextResponse.json({ success: false, error: { code: 'insufficient_funds', message: 'Insufficient balance in source account' } }, { status: 400 });
    }

    // Perform the conversion (simplified without transactions for now)
    try {
      // Update balances
      const fromUpdateResult = await accountsCollection.updateOne(
        { _id: fromObjectId, userId },
        { $inc: { balance: -amount }, $set: { updatedAt: new Date() } }
      );

      const toUpdateResult = await accountsCollection.updateOne(
        { _id: toObjectId, userId },
        { $inc: { balance: toAmount }, $set: { updatedAt: new Date() } }
      );

      if (fromUpdateResult.matchedCount === 0 || toUpdateResult.matchedCount === 0) {
        return NextResponse.json({ success: false, error: { code: 'update_failed', message: 'Failed to update account balances' } }, { status: 500 });
      }

      // Record the conversion
      const conversionResult = await conversionsCollection.insertOne({
        userId,
        fromAccountId,
        toAccountId,
        fromCurrency: fromAccount.currency,
        toCurrency: toAccount.currency,
        fromAmount: amount,
        toAmount,
        exchangeRate: rate,
        description: description || `Converted ${amount} ${fromAccount.currency} to ${toAccount.currency}`,
        createdAt: new Date()
      });

      if (!conversionResult.insertedId) {
        return NextResponse.json({ success: false, error: { code: 'insert_failed', message: 'Failed to record conversion' } }, { status: 500 });
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json({ success: false, error: { code: 'database_error', message: 'Database operation failed' } }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Currency conversion completed successfully',
        fromAmount: amount,
        toAmount,
        exchangeRate: rate
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: { code: 'internal_error', message: 'Internal server error' } }, { status: 500 });
  }
}