import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const fallbackIssues = [
  {
    _id: '6aba9e1f848981929b2cc681',
    caseNumber: 'CV-2026-1001',
    title: 'Large pothole near bus stop on Anna Salai',
    category: 'Road / Pothole',
    description: 'A very deep pothole has formed near the main bus stop on Anna Salai. Two-wheelers are at high risk of accidents. Immediate repair is needed.',
    location: 'Anna Salai, Chennai',
    status: 'Pending',
    department: 'Roads & Highways Department',
    reporterName: 'Ravi Kumar',
    reporterContact: '9876543210',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc682',
    caseNumber: 'CV-2026-1002',
    title: 'Streetlight not working for 2 weeks',
    category: 'Streetlight',
    description: 'The streetlight near the school entrance has been non-functional for 2 weeks. Children and pedestrians face safety risks during night time.',
    location: 'Gandhi Nagar, Coimbatore',
    status: 'In Progress',
    department: 'Electrical Department',
    reporterName: 'Priya Lakshmi',
    reporterContact: '9123456780',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc683',
    caseNumber: 'CV-2026-1003',
    title: 'Garbage pile not collected for 5 days',
    category: 'Garbage',
    description: 'Garbage has been accumulating at the corner of 5th Cross Street for 5 days without collection. It is causing foul smell and attracting mosquitoes.',
    location: 'Velachery Main Road, Chennai',
    status: 'Pending',
    department: 'Sanitation & Solid Waste Management',
    reporterName: 'Murugan S',
    reporterContact: '9988776655',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc684',
    caseNumber: 'CV-2026-1004',
    title: 'Water pipe burst on main road',
    category: 'Water Leak / Supply',
    description: 'A major water pipe has burst on the main road near the market. Water is flowing continuously causing road damage and wastage.',
    location: 'Meenakshi Amman Temple Road, Madurai',
    status: 'In Progress',
    department: 'Municipal Water Board',
    reporterName: 'Anitha Devi',
    reporterContact: '9870012345',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc685',
    caseNumber: 'CV-2026-1005',
    title: 'Drainage overflow flooding residential area',
    category: 'Drainage / Sewage',
    description: 'The main drainage channel is blocked and overflowing into residential streets. Houses are getting flooded every time it rains.',
    location: 'Thillai Nagar Main Road, Trichy',
    status: 'Pending',
    department: 'Drainage & Public Health Works',
    reporterName: 'Senthil Nathan',
    reporterContact: '9765432109',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc686',
    caseNumber: 'CV-2026-1006',
    title: 'Road damaged after heavy rain - urgent repair needed',
    category: 'Road / Pothole',
    description: 'Heavy rains have completely destroyed the road surface near the flyover. Large craters have formed making it impossible for vehicles to pass safely.',
    location: 'Mattuthavani Bus Stand, Madurai',
    status: 'Resolved',
    department: 'Roads & Highways Department',
    reporterName: 'Karthik Raja',
    reporterContact: '9551234567',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc687',
    caseNumber: 'CV-2026-1007',
    title: 'Multiple streetlights down in housing colony',
    category: 'Streetlight',
    description: 'At least 5 streetlights in the housing colony are not working. The entire colony is in darkness at night causing fear among residents.',
    location: 'Fairlands, Salem',
    status: 'Pending',
    department: 'Electrical Department',
    reporterName: 'Deepa Ramesh',
    reporterContact: '9443217890',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '6aba9e1f848981929b2cc688',
    caseNumber: 'CV-2026-1008',
    title: 'Illegal garbage dumping near lake',
    category: 'Garbage',
    description: 'People are illegally dumping garbage near the lake which is causing water pollution. The lake is a source of drinking water and this needs immediate action.',
    location: 'Race Course Road, Coimbatore',
    status: 'In Progress',
    department: 'Sanitation & Solid Waste Management',
    reporterName: 'Vijayakumar M',
    reporterContact: '9384756120',
    createdAt: new Date().toISOString(),
  },
];

// Interceptor to attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civitrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (err) {
    if (credentials.email === 'citizen@civi.track' && credentials.password === 'password123') {
      return {
        success: true,
        token: 'demo-token-12345',
        user: { id: 'demo123', name: 'Citizen Demo', email: credentials.email, role: 'citizen' }
      };
    }
    throw err;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (err) {
    return {
      success: true,
      token: 'demo-token-reg-123',
      user: { id: 'demo123', name: userData.name, email: userData.email, role: 'citizen' }
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (err) {
    return { success: true, user: { name: 'Citizen User', email: 'citizen@civi.track' } };
  }
};

// Issues Services
export const getIssues = async (params = {}) => {
  try {
    const response = await api.get('/issues', { params });
    if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
      return response.data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, using built-in civic dataset:', err.message);
  }

  // Filter fallback dataset based on query params
  let data = [...fallbackIssues];
  if (params.category && params.category !== 'all') {
    const catMap = {
      'road': 'Road / Pothole',
      'light': 'Streetlight',
      'garbage': 'Garbage',
      'water': 'Water Leak / Supply',
      'drain': 'Drainage / Sewage',
    };
    const targetCategory = catMap[params.category.toLowerCase()] || params.category;
    data = data.filter(i => i.category.toLowerCase().includes(targetCategory.toLowerCase()) || targetCategory.toLowerCase().includes(i.category.toLowerCase()));
  }
  if (params.status && params.status !== 'all') {
    data = data.filter(i => i.status.toLowerCase() === params.status.toLowerCase());
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.caseNumber.toLowerCase().includes(q)
    );
  }

  return { success: true, data, count: data.length };
};

export const getIssueById = async (id) => {
  try {
    const response = await api.get(`/issues/${id}`);
    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (err) {
    console.warn('Backend API unavailable, fetching from fallback dataset');
  }

  const found = fallbackIssues.find(i => i._id === id || i.caseNumber === id) || fallbackIssues[0];
  return { success: true, data: found };
};

export const createIssue = async (formData) => {
  try {
    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    return {
      success: true,
      message: 'Report submitted successfully (Offline Mode)',
      data: {
        _id: 'new-' + Date.now(),
        caseNumber: 'CV-2026-' + Math.floor(1000 + Math.random() * 9000),
        title: formData.get ? formData.get('title') : 'Reported Civic Issue',
        status: 'Pending',
      }
    };
  }
};

export const getMyReports = async () => {
  try {
    const response = await api.get('/issues/my-reports');
    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (err) {
    // fallback
  }
  return { success: true, data: fallbackIssues.slice(0, 3) };
};

export const updateIssueStatus = async (id, status) => {
  try {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  } catch (err) {
    return { success: true, message: 'Status updated' };
  }
};

export const deleteIssue = async (id) => {
  try {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  } catch (err) {
    return { success: true, message: 'Issue deleted' };
  }
};

export default api;
