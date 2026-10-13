import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  FoodDonation,
  FoodRequest,
  InstitutionProfile,
  DonorProfile,
  NotificationItem,
  ComplaintReport,
  SmartMatchResult,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_DONORS,
  INITIAL_INSTITUTIONS,
  INITIAL_DONATIONS,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPLAINTS,
} from '../data/mockData';
import { calculateDistanceKm, getCoordinatesForArea } from '../utils/geoUtils';
import { translations, Language } from '../utils/translations';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole | 'guest';
  setCurrentRole: (role: UserRole | 'guest') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  
  // Data
  donations: FoodDonation[];
  institutions: InstitutionProfile[];
  donors: DonorProfile[];
  requests: FoodRequest[];
  notifications: NotificationItem[];
  complaints: ComplaintReport[];
  
  // Actions
  loginAs: (role: UserRole) => void;
  logout: () => void;
  loginWithCredentials: (email: string, role: UserRole) => boolean;
  registerUser: (userData: any, role: UserRole) => boolean;
  
  addDonation: (donationData: Omit<FoodDonation, 'id' | 'createdAt' | 'status' | 'remainingQuantity'>) => FoodDonation;
  updateDonation: (id: string, updates: Partial<FoodDonation>) => void;
  deleteDonation: (id: string) => void;
  
  createRequest: (requestData: {
    donationId: string;
    requestedPortions: number;
    peopleToFeed: number;
    preferredTime: string;
    logisticsType: 'Self Pickup' | 'Request Delivery';
    dietaryRequirements: string;
    additionalNotes: string;
  }) => { success: boolean; message: string };
  
  updateRequestStatus: (requestId: string, status: FoodRequest['status'], reason?: string) => void;
  
  verifyInstitution: (id: string, isVerified: boolean) => void;
  verifyDonor: (id: string, isVerified: boolean) => void;
  
  fileComplaint: (complaint: Omit<ComplaintReport, 'id' | 'createdAt' | 'status'>) => void;
  resolveComplaint: (id: string, status: 'Resolved' | 'Dismissed', adminNotes: string) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  getSmartMatchesForDonation: (donation: FoodDonation) => SmartMatchResult[];
  exportDonationsReportCSV: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // default Donor
  const [currentRole, setCurrentRole] = useState<UserRole | 'guest'>('donor');
  
  const [donations, setDonations] = useState<FoodDonation[]>(() => {
    const saved = localStorage.getItem('foodshare_donations');
    return saved ? JSON.parse(saved) : INITIAL_DONATIONS;
  });

  const [institutions, setInstitutions] = useState<InstitutionProfile[]>(() => {
    const saved = localStorage.getItem('foodshare_institutions');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONS;
  });

  const [donors, setDonors] = useState<DonorProfile[]>(() => {
    const saved = localStorage.getItem('foodshare_donors');
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });

  const [requests, setRequests] = useState<FoodRequest[]>(() => {
    const saved = localStorage.getItem('foodshare_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('foodshare_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [complaints, setComplaints] = useState<ComplaintReport[]>(() => {
    const saved = localStorage.getItem('foodshare_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('foodshare_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('foodshare_institutions', JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    localStorage.setItem('foodshare_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem('foodshare_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('foodshare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('foodshare_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Periodic check for expired food listings
  useEffect(() => {
    const checkExpirations = () => {
      const now = new Date().toISOString();
      setDonations((prev) =>
        prev.map((don) => {
          if (
            don.status !== 'Collected' &&
            don.status !== 'Delivered' &&
            don.status !== 'Expired' &&
            don.status !== 'Cancelled' &&
            new Date(don.safeCollectionDeadline).getTime() < new Date(now).getTime()
          ) {
            return { ...don, status: 'Expired', remainingQuantity: 0 };
          }
          return don;
        })
      );
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  const t = translations[language];

  const loginAs = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(user);
    setCurrentRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
  };

  const loginWithCredentials = (email: string, role: UserRole): boolean => {
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.role);
      return true;
    }
    // Create session for user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+94 77 000 0000',
      role,
      isVerified: true,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setCurrentUser(newUser);
    setCurrentRole(role);
    return true;
  };

  const registerUser = (userData: any, role: UserRole): boolean => {
    const newId = `user-${Date.now()}`;
    const user: User = {
      id: newId,
      name: userData.name || userData.institutionName || 'New User',
      email: userData.email,
      phone: userData.phone,
      role,
      isVerified: false, // Requires admin verification
      registeredDate: new Date().toISOString().split('T')[0],
    };

    if (role === 'donor') {
      const newDonor: DonorProfile = {
        ...user,
        organizationType: userData.organizationType || 'Wedding Hall',
        address: userData.address || 'Jaffna',
        area: userData.area || 'Nallur',
        district: 'Jaffna',
        contactPerson: userData.contactPerson || userData.name,
      };
      setDonors((prev) => [newDonor, ...prev]);
    } else if (role === 'institution') {
      const coords = getCoordinatesForArea(userData.area || 'Jaffna Town');
      const newInst: InstitutionProfile = {
        ...user,
        institutionType: userData.institutionType || "Children's Home",
        registrationNumber: userData.registrationNumber || `DSW/NP/JAF/${Date.now().toString().slice(-4)}`,
        address: userData.address || 'Jaffna',
        area: userData.area || 'Jaffna Town',
        district: 'Jaffna',
        residentCount: Number(userData.residentCount) || 30,
        dietaryPreferences: userData.dietaryPreferences || ['Pure Vegetarian Preferred'],
        operatingHours: userData.operatingHours || '08:00 AM - 08:00 PM',
        contactPerson: userData.contactPerson || userData.name,
        latitude: coords.latitude,
        longitude: coords.longitude,
        needsDelivery: !!userData.needsDelivery,
        notes: userData.notes || 'Newly registered institution awaiting verification.',
      };
      setInstitutions((prev) => [newInst, ...prev]);
    }

    setCurrentUser(user);
    setCurrentRole(role);

    // Notify Admin of new registration
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: 'admin',
      title: 'New Account Pending Verification',
      message: `${user.name} registered as a ${role}. Review their verification details.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return true;
  };

  const addDonation = (
    data: Omit<FoodDonation, 'id' | 'createdAt' | 'status' | 'remainingQuantity'>
  ): FoodDonation => {
    const coords = data.latitude && data.longitude ? { latitude: data.latitude, longitude: data.longitude } : getCoordinatesForArea(data.area);
    const newDonation: FoodDonation = {
      ...data,
      id: `don-${Date.now()}`,
      remainingQuantity: data.totalQuantity,
      latitude: coords.latitude,
      longitude: coords.longitude,
      status: 'Available',
      createdAt: new Date().toISOString(),
    };

    setDonations((prev) => [newDonation, ...prev]);

    // Send notifications to nearby registered institutions
    const nearbyHomes = institutions.filter(
      (inst) => inst.isVerified && calculateDistanceKm(coords.latitude, coords.longitude, inst.latitude, inst.longitude) <= 15
    );

    const newNotifs: NotificationItem[] = nearbyHomes.map((inst) => ({
      id: `notif-${Date.now()}-${inst.id}`,
      recipientId: inst.id,
      title: 'New Food Donation Nearby',
      message: `${newDonation.donorName} in ${newDonation.area} posted ${newDonation.totalQuantity} portions of '${newDonation.foodName}'.`,
      type: 'request',
      isRead: false,
      createdAt: new Date().toISOString(),
    }));

    if (newNotifs.length > 0) {
      setNotifications((prev) => [...newNotifs, ...prev]);
    }

    return newDonation;
  };

  const updateDonation = (id: string, updates: Partial<FoodDonation>) => {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDonation = (id: string) => {
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  const createRequest = (requestData: {
    donationId: string;
    requestedPortions: number;
    peopleToFeed: number;
    preferredTime: string;
    logisticsType: 'Self Pickup' | 'Request Delivery';
    dietaryRequirements: string;
    additionalNotes: string;
  }): { success: boolean; message: string } => {
    const donation = donations.find((d) => d.id === requestData.donationId);
    if (!donation) {
      return { success: false, message: 'Donation listing not found.' };
    }

    if (donation.status === 'Expired' || new Date(donation.safeCollectionDeadline).getTime() < Date.now()) {
      return { success: false, message: 'This donation has expired and cannot be requested for food safety reasons.' };
    }

    if (donation.remainingQuantity < requestData.requestedPortions) {
      return {
        success: false,
        message: `Requested portions (${requestData.requestedPortions}) exceed remaining available quantity (${donation.remainingQuantity} portions).`,
      };
    }

    const currentInst = institutions.find((i) => i.id === currentUser?.id) || institutions[0];

    const newRequest: FoodRequest = {
      id: `req-${Date.now()}`,
      donationId: donation.id,
      donationFoodName: donation.foodName,
      donorId: donation.donorId,
      donorName: donation.donorName,
      institutionId: currentInst.id,
      institutionName: currentInst.name,
      institutionType: currentInst.institutionType,
      requestedPortions: requestData.requestedPortions,
      peopleToFeed: requestData.peopleToFeed,
      preferredTime: requestData.preferredTime,
      logisticsType: requestData.logisticsType,
      dietaryRequirements: requestData.dietaryRequirements,
      additionalNotes: requestData.additionalNotes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Update donation status to indicate request received
    setDonations((prev) =>
      prev.map((d) => (d.id === donation.id ? { ...d, status: 'Request Received' } : d))
    );

    // Notify Donor
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: donation.donorId,
      title: 'New Food Request Received',
      message: `${currentInst.name} has requested ${requestData.requestedPortions} portions of '${donation.foodName}'.`,
      type: 'request',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true, message: 'Your food request was submitted successfully! The donor will review it.' };
  };

  const updateRequestStatus = (requestId: string, newStatus: FoodRequest['status'], reason?: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: newStatus,
              rejectionReason: reason || r.rejectionReason,
              updatedAt: new Date().toISOString(),
              collectionCompletedAt:
                newStatus === 'Collected' || newStatus === 'Delivered'
                  ? new Date().toISOString()
                  : r.collectionCompletedAt,
            }
          : r
      )
    );

    // Update corresponding donation portions & status
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id === targetReq.donationId) {
          if (newStatus === 'Approved') {
            const newRemaining = Math.max(0, d.remainingQuantity - targetReq.requestedPortions);
            return {
              ...d,
              remainingQuantity: newRemaining,
              status: newRemaining === 0 ? 'Approved' : 'Available',
              approvedRequestsCount: (d.approvedRequestsCount || 0) + 1,
            };
          } else if (newStatus === 'Rejected' && targetReq.status === 'Approved') {
            // Restore quantity if previously approved
            return {
              ...d,
              remainingQuantity: d.remainingQuantity + targetReq.requestedPortions,
              status: 'Available',
            };
          } else if (newStatus === 'Collected' || newStatus === 'Delivered') {
            return {
              ...d,
              status: d.remainingQuantity === 0 ? 'Collected' : d.status,
            };
          }
        }
        return d;
      })
    );

    // Send in-app notification to institution
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: targetReq.institutionId,
      title: `Food Request ${newStatus}`,
      message: `Your request for ${targetReq.requestedPortions} portions of '${targetReq.donationFoodName}' was marked as ${newStatus}.${
        reason ? ` Reason: ${reason}` : ''
      }`,
      type: newStatus === 'Approved' ? 'approval' : newStatus === 'Rejected' ? 'rejection' : 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const verifyInstitution = (id: string, isVerified: boolean) => {
    setInstitutions((prev) => prev.map((i) => (i.id === id ? { ...i, isVerified } : i)));
  };

  const verifyDonor = (id: string, isVerified: boolean) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, isVerified } : d)));
  };

  const fileComplaint = (complaint: Omit<ComplaintReport, 'id' | 'createdAt' | 'status'>) => {
    const newComp: ComplaintReport = {
      ...complaint,
      id: `comp-${Date.now()}`,
      status: 'Investigating',
      createdAt: new Date().toISOString(),
    };
    setComplaints((prev) => [newComp, ...prev]);

    // Notify Admin
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: 'admin',
      title: `New Report: ${complaint.reason}`,
      message: `A report was submitted regarding ${complaint.targetTitle} by ${complaint.reporterName}.`,
      type: 'safety',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const resolveComplaint = (id: string, status: 'Resolved' | 'Dismissed', adminNotes: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, adminNotes } : c))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Smart Food Matching algorithm for Jaffna District
  const getSmartMatchesForDonation = (donation: FoodDonation): SmartMatchResult[] => {
    const donorCoords =
      donation.latitude && donation.longitude
        ? { latitude: donation.latitude, longitude: donation.longitude }
        : getCoordinatesForArea(donation.area);

    const now = new Date().getTime();
    const deadline = new Date(donation.safeCollectionDeadline).getTime();
    const remainingHours = Math.max(0, (deadline - now) / (1000 * 60 * 60));

    return institutions
      .filter((inst) => inst.isVerified)
      .map((inst) => {
        const distanceKm = calculateDistanceKm(
          donorCoords.latitude,
          donorCoords.longitude,
          inst.latitude,
          inst.longitude
        );

        // Dietary fit check
        const isStrictVegPref = inst.dietaryPreferences.some((p) => p.toLowerCase().includes('vegetarian'));
        const dietaryFit = !isStrictVegPref || donation.isVegetarian;

        // Capacity match (ideal if residentCount is close to or <= donation remaining quantity)
        const canServePortions = Math.min(donation.remainingQuantity, inst.residentCount);
        const capacityMatchRatio = canServePortions / Math.max(1, inst.residentCount);

        // Suitability calculation:
        // - Distance factor: closer is much better (max 25km)
        // - Dietary compatibility
        // - Time buffer remaining
        let score = 100;
        score -= Math.min(50, distanceKm * 2.5); // 0-50 pts lost based on distance
        if (!dietaryFit) score -= 35; // Dietary mismatch penalty
        if (remainingHours < 2) score -= 20; // Short deadline urgency
        if (capacityMatchRatio > 0.5) score += 10; // Good feeding coverage

        const normalizedScore = Math.max(15, Math.min(99, Math.round(score)));

        let reason = '';
        if (distanceKm <= 3) {
          reason = `Very close (${distanceKm} km) in ${inst.area}. Can feed ${canServePortions} residents before deadline.`;
        } else if (dietaryFit && distanceKm <= 10) {
          reason = `Good dietary match (${distanceKm} km). Resident requirements align with ${donation.category}.`;
        } else {
          reason = `Located ${distanceKm} km away in ${inst.area}. Accessible via main Jaffna road network.`;
        }

        return {
          institution: inst,
          distanceKm,
          suitabilityScore: normalizedScore,
          reason,
          canServePortions,
          dietaryFit,
          timeBufferHours: Math.round(remainingHours * 10) / 10,
        };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore || a.distanceKm - b.distanceKm);
  };

  const exportDonationsReportCSV = () => {
    const headers = [
      'Donation ID',
      'Food Name',
      'Category',
      'Donor Name',
      'Venue / Address',
      'Jaffna Area',
      'Total Portions',
      'Remaining Portions',
      'Vegetarian',
      'Prepared At',
      'Collection Deadline',
      'Status',
      'Created At',
    ];

    const rows = donations.map((d) => [
      `"${d.id}"`,
      `"${d.foodName.replace(/"/g, '""')}"`,
      `"${d.category}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${d.pickupAddress.replace(/"/g, '""')}"`,
      `"${d.area}"`,
      d.totalQuantity,
      d.remainingQuantity,
      d.isVegetarian ? 'Yes' : 'No',
      `"${d.preparedAt}"`,
      `"${d.safeCollectionDeadline}"`,
      `"${d.status}"`,
      `"${d.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `foodshare_lanka_donations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        t,
        donations,
        institutions,
        donors,
        requests,
        notifications,
        complaints,
        loginAs,
        logout,
        loginWithCredentials,
        registerUser,
        addDonation,
        updateDonation,
        deleteDonation,
        createRequest,
        updateRequestStatus,
        verifyInstitution,
        verifyDonor,
        fileComplaint,
        resolveComplaint,
        markNotificationRead,
        markAllNotificationsRead,
        getSmartMatchesForDonation,
        exportDonationsReportCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
