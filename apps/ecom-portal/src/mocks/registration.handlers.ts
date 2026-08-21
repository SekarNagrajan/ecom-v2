import { http, HttpResponse, delay } from 'msw';

export const registrationHandlers = [
  http.post('/api/registration', async ({ request }) => {
    // Artificial delay to simulate network latency
    await delay(1500);

    try {
      const formData = await request.formData();
      const companyName = formData.get('companyName');

      if (companyName === 'ErrorCorp') {
        return HttpResponse.json(
          { success: false, message: 'Company name is blacklisted' },
          { status: 400 }
        );
      }

      // Simulate success
      return HttpResponse.json({
        success: true,
        message: 'Registration successful',
        userId: 'U' + Math.floor(Math.random() * 1000000),
      });
    } catch (e) {
      return HttpResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  http.get('/api/address-lookup', async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    // Simulate delay
    await delay(300);
    
    // Mock data for address lookup
    const mockResults = [
      { id: '1', companyName: `${query} Global Logistics`, address1: '123 Shipping Lane', city: 'London', country: 'GB' },
      { id: '2', companyName: `${query} Maritime Inc`, address1: '456 Harbor Blvd', city: 'Singapore', country: 'SG' },
      { id: '3', companyName: `${query} Freight Solutions`, address1: '789 Cargo Way', city: 'New York', country: 'US' },
    ];
    
    return HttpResponse.json({ results: mockResults });
  }),

  http.get('/api/check-company', async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    await delay(500);
    
    if (code === 'CUST123') {
      return HttpResponse.json({
        valid: true,
        companyName: 'Acme Logistics',
        country: 'US',
        address1: '100 Main St',
        city: 'Seattle',
      });
    }
    
    return HttpResponse.json({ valid: false }, { status: 404 });
  }),

  http.get('/api/check-email', async ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    await delay(400);
    
    // Simulate taken email
    if (email === 'taken@example.com') {
      return HttpResponse.json({ available: false });
    }
    
    return HttpResponse.json({ available: true });
  }),
];
