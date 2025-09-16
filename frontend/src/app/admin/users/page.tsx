'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersAPI, handleApiError } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserManagementPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  
  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form states
  const [addUserForm, setAddUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });
  
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined
      });
      
      if (response.success) {
        setUsers(response.data.users);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        });
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const response = await usersAPI.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Fetch users when search/filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search
    
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handleEditUser = (userId: string, userName: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setEditUserForm({
        fullName: userToEdit.fullName,
        email: userToEdit.email,
        role: userToEdit.role
      });
      setIsEditUserOpen(true);
    }
  };

  const handleChangeRole = (userId: string, userName: string, currentRole: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setIsChangeRoleOpen(true);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setSelectedUser(userToDelete);
      setIsDeleteUserOpen(true);
    }
  };

  const handleAddUser = () => {
    setAddUserForm({
      fullName: '',
      email: '',
      password: '',
      role: 'USER'
    });
    setIsAddUserOpen(true);
  };

  const submitAddUser = async () => {
    try {
      const response = await usersAPI.createUser(addUserForm);
      if (response.success) {
        toast.success(response.message);
        setIsAddUserOpen(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const submitEditUser = async () => {
    try {
      const response = await usersAPI.updateUser(selectedUser.id, editUserForm);
      if (response.success) {
        toast.success(response.message);
        setIsEditUserOpen(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const submitChangeRole = async (newRole: 'USER' | 'ADMIN') => {
    try {
      const response = await usersAPI.updateUser(selectedUser.id, { role: newRole });
      if (response.success) {
        toast.success(response.message);
        setIsChangeRoleOpen(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await usersAPI.deleteUser(selectedUser.id);
      if (response.success) {
        toast.success(response.message);
        setIsDeleteUserOpen(false);
        fetchUsers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <DashboardLayout requiredRole="ADMIN">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#72c306] to-[#8fd428] bg-clip-text text-transparent">User Management</h1>
                <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-[#72c306] to-[#8fd428] hover:from-[#72c306]/90 hover:to-[#8fd428]/90 shadow-lg shadow-[#72c306]/25"
              onClick={handleAddUser}
            >
              <User className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306] text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#72c306] focus:border-[#72c306] text-white"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-400">
            <span>Total Users: {pagination.total}</span>
            <span>Active: {stats.verified || 0}</span>
            <span>Pending: {stats.unverified || 0}</span>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div variants={fadeInUp} className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Users ({isLoading ? '...' : users.length})
              {isLoading && <Loader2 className="inline h-4 w-4 ml-2 animate-spin text-[#72c306]" />}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#72c306]" />
                        <span className="text-white">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((userData, index) => (
                    <motion.tr
                      key={userData.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#72c306] to-[#8fd428] flex items-center justify-center text-white font-medium">
                            {userData.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {userData.fullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData.role === 'ADMIN'
                            ? 'bg-gradient-to-r from-[#72c306]/20 to-[#8fd428]/20 text-[#72c306] border border-[#72c306]/30'
                            : 'bg-gray-800 text-gray-300'
                        }`}>
                          {userData.role === 'ADMIN' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userData.emailVerified
                            ? 'bg-[#72c306]/20 text-[#72c306] border border-[#72c306]/30'
                            : 'bg-orange-600/20 text-orange-400 border border-orange-600/30'
                        }`}>
                          {userData.emailVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {userData.lastLoginAt
                            ? new Date(userData.lastLoginAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'Never'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black border-gray-800">
                            <DropdownMenuItem onClick={() => handleEditUser(userData.id, userData.fullName)} className="text-white hover:bg-gray-800">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChangeRole(userData.id, userData.fullName, userData.role)} className="text-[#72c306] hover:bg-gray-800">
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-gray-800"
                              onClick={() => handleDeleteUser(userData.id, userData.fullName)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#72c306] mb-1">{stats.total || 0}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#72c306] mb-1">
              {stats.verified || 0}
            </div>
            <div className="text-sm text-gray-400">Verified Users</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#72c306] mb-1">
              {stats.admins || 0}
            </div>
            <div className="text-sm text-gray-400">Admin Users</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {stats.unverified || 0}
            </div>
            <div className="text-sm text-gray-400">Pending Users</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specified role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addFullName">Full Name</Label>
              <input
                id="addFullName"
                type="text"
                value={addUserForm.fullName}
                onChange={(e) => setAddUserForm({...addUserForm, fullName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="addEmail">Email</Label>
              <input
                id="addEmail"
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({...addUserForm, email: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="addPassword">Password</Label>
              <input
                id="addPassword"
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({...addUserForm, password: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <Label htmlFor="addRole">Role</Label>
              <Select value={addUserForm.role} onValueChange={(value: 'USER' | 'ADMIN') => setAddUserForm({...addUserForm, role: value})}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitAddUser}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Full Name</Label>
              <input
                id="editFullName"
                type="text"
                value={editUserForm.fullName}
                onChange={(e) => setEditUserForm({...editUserForm, fullName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <input
                id="editEmail"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select value={editUserForm.role} onValueChange={(value: 'USER' | 'ADMIN') => setEditUserForm({...editUserForm, role: value})}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitEditUser}>
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Current Role:</p>
              <p className="font-medium">{selectedUser?.role}</p>
            </div>
            <div className="space-y-2">
              <Label>New Role</Label>
              <div className="space-y-2">
                <Button
                  variant={selectedUser?.role !== 'USER' ? 'outline' : 'default'}
                  className="w-full justify-start"
                  onClick={() => submitChangeRole('USER')}
                  disabled={selectedUser?.role === 'USER'}
                >
                  <User className="mr-2 h-4 w-4" />
                  User
                </Button>
                <Button
                  variant={selectedUser?.role !== 'ADMIN' ? 'outline' : 'default'}
                  className="w-full justify-start"
                  onClick={() => submitChangeRole('ADMIN')}
                  disabled={selectedUser?.role === 'ADMIN'}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsChangeRoleOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium mr-3">
                  {selectedUser?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedUser?.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedUser?.email}</p>
                  <p className="text-xs text-red-600">Role: {selectedUser?.role}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteUser}>
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagementPage;