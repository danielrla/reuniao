async function testTaskCreation() {
    try {
        console.log("Authenticating to get a token...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@system.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in. Token acquired.");

        const meetingsRes = await fetch('http://localhost:3000/api/meetings', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const meetingsData = await meetingsRes.json();
        if (!meetingsData.data || !meetingsData.data.length) {
            console.log("No meetings found.");
            return;
        }

        const meetingId = meetingsData.data[0].id;
        console.log("Using meeting:", meetingId);

        const payload = {
            meetingId: meetingId,
            description: "Test Task from Script",
            dueDate: new Date().toISOString()
        };

        console.log("Sending payload:", payload);
        const res = await fetch('http://localhost:3000/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);

    } catch (error: any) {
        console.error("Failed!", error.message);
    }
}

testTaskCreation();
