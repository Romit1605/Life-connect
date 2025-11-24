import { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';

export type UserRole = 'donor' | 'hospital' | 'ngo' | 'pharmacy' | 'government' | 'volunteer' | 'blood_bank';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      // User role is stored in the user object from our backend
      if (user.role) {
        setRoles([user.role as UserRole]);
      } else {
        setRoles([]);
      }
      setLoading(false);
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);

  return { roles, hasRole, loading };
};