"use client";

import { useState, useEffect } from "react";

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  createdAt: string;
}

export default function SplitExpensesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePaidBy, setNewExpensePaidBy] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupExpenses(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/v1/groups');
      const json = await res.json();
      if (json.success) {
        setGroups(json.data.groups);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupExpenses = async (groupId: string) => {
    try {
      const res = await fetch(`/api/v1/groups/${groupId}/expenses`);
      const json = await res.json();
      if (json.success) {
        setGroupExpenses(json.data.expenses);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddGroup = async () => {
    if (newGroupName && newGroupMembers) {
      const members = newGroupMembers.split(',').map((m: string) => m.trim()).filter((m: string) => m);
      if (members.length < 1) return;

      try {
        const res = await fetch('/api/v1/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newGroupName, members })
        });
        const json = await res.json();
        if (json.success) {
          fetchGroups();
          setNewGroupName('');
          setNewGroupMembers('');
          setShowAddForm(false);
        } else {
          alert(json.error.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAddExpense = async () => {
    if (!selectedGroup || !newExpenseDesc || !newExpenseAmount || !newExpensePaidBy) return;

    try {
      const res = await fetch(`/api/v1/groups/${selectedGroup.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpenseDesc,
          amount: parseFloat(newExpenseAmount),
          paidBy: newExpensePaidBy
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchGroupExpenses(selectedGroup.id);
        setNewExpenseDesc('');
        setNewExpenseAmount('');
        setNewExpensePaidBy('');
        setShowAddExpense(false);
      } else {
        alert(json.error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Split Expenses</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-[#1e7f8c] text-white rounded-lg">Create New Group</button>
      </div>

      {showAddForm && (
        <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730] mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Group</h3>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Group Name</label>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Beach Trip"
              className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Members (comma-separated emails or names)</label>
            <input
              value={newGroupMembers}
              onChange={(e) => setNewGroupMembers(e.target.value)}
              placeholder="e.g. friend1@example.com, friend2@example.com"
              className="w-full rounded bg-[#14141a] placeholder:text-gray-500 px-3 py-2 text-sm border border-[#222229]"
            />
          </div>
          <button onClick={handleAddGroup} className="px-4 py-2 bg-[#1e7f8c] text-white rounded">Create</button>
          <button onClick={() => setShowAddForm(false)} className="ml-2 px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
          <h3 className="text-lg font-semibold text-white mb-4">Your Groups</h3>
          {loading ? (
            <div>Loading...</div>
          ) : groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.id} className="p-4 border border-[#26232a] rounded flex items-center justify-between cursor-pointer hover:bg-[#26232a]" onClick={() => setSelectedGroup(g)}>
                  <div>
                    <div className="text-sm text-white">{g.name}</div>
                    <div className="text-xs text-gray-400">{g.members.length} members</div>
                  </div>
                  <div className="text-teal-400">→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No groups yet. Create your first group!</div>
          )}
        </div>

        <div className="bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
          {selectedGroup ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{selectedGroup.name}</h3>
                <button onClick={() => setShowAddExpense(!showAddExpense)} className="px-3 py-1 bg-[#1e7f8c] text-white rounded text-sm">+ Add Expense</button>
              </div>
              <div className="mb-4">
                <h4 className="text-sm text-gray-400 mb-2">Members:</h4>
                <ul className="text-sm text-white">
                  {selectedGroup.members.map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </div>

              {showAddExpense && (
                <div className="bg-[#14141a] p-4 rounded mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Add Shared Expense</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      value={newExpenseDesc}
                      onChange={(e) => setNewExpenseDesc(e.target.value)}
                      placeholder="Description"
                      className="rounded bg-[#0f1114] px-2 py-1 text-sm border border-[#222229]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      placeholder="Amount"
                      className="rounded bg-[#0f1114] px-2 py-1 text-sm border border-[#222229]"
                    />
                    <select
                      value={newExpensePaidBy}
                      onChange={(e) => setNewExpensePaidBy(e.target.value)}
                      className="rounded bg-[#0f1114] px-2 py-1 text-sm border border-[#222229]"
                    >
                      <option value="">Paid by</option>
                      {selectedGroup.members.map((member, index) => (
                        <option key={index} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddExpense} className="px-3 py-1 bg-[#1e7f8c] text-white rounded text-sm">Add</button>
                    <button onClick={() => setShowAddExpense(false)} className="px-3 py-1 bg-gray-600 text-white rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-semibold text-white mb-2">Expenses:</h4>
              {groupExpenses.length > 0 ? (
                <div className="space-y-2">
                  {groupExpenses.map((exp) => (
                    <div key={exp.id} className="p-2 bg-[#14141a] rounded text-sm">
                      <div className="flex justify-between">
                        <span className="text-white">{exp.description}</span>
                        <span className="text-green-400">₹{exp.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-400">Paid by {exp.paidBy}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No expenses yet.</div>
              )}

              <button onClick={() => setSelectedGroup(null)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Back</button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-2"><i className="fas fa-users" /></div>
              <div className="font-semibold text-white mb-1">Select a group</div>
              <div>Choose a group from the list to view and manage shared expenses.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
