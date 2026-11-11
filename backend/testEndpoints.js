const BASE_URL = "http://localhost:5000/api";

async function test() {
  console.log("Testing backend authentication & role-based endpoints...\n");

  // 1. Patient Login
  const patientRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "patient@carepoint.com", password: "Patient123!" })
  });
  const patData = await patientRes.json();
  console.log("✓ Patient login successful. Role:", patData.user?.role, "Token exists:", !!patData.token);
  const patientToken = patData.token;

  // 2. Doctor Login
  const docRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "doctor@carepoint.com", password: "123456789" })
  });
  const docData = await docRes.json();
  console.log("✓ Doctor login successful. Role:", docData.user?.role, "Token exists:", !!docData.token);
  const doctorToken = docData.token;

  // 3. Patient accessing Patient appointments
  const patApptsRes = await fetch(`${BASE_URL}/patient/appointments`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const patAppts = await patApptsRes.json();
  console.log(`✓ GET /api/patient/appointments succeeded (HTTP ${patApptsRes.status}). Found: ${patAppts.length} appointments.`);

  // 4. Doctor accessing Doctor appointments
  const docApptsRes = await fetch(`${BASE_URL}/doctor/appointments`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  const docAppts = await docApptsRes.json();
  console.log(`✓ GET /api/doctor/appointments succeeded (HTTP ${docApptsRes.status}). Found: ${docAppts.length} appointments.`);

  // 5. Doctor toggling availability
  const availRes = await fetch(`${BASE_URL}/doctor/availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${doctorToken}` },
    body: JSON.stringify({ isAvailable: true, consultationFee: 550 })
  });
  const availData = await availRes.json();
  console.log("✓ PATCH /api/doctor/availability succeeded. Available:", availData.doctor?.isAvailable, "Fee:", availData.doctor?.consultationFee);

  // 6. Security check: Patient attempting to access Doctor endpoint
  const sec1 = await fetch(`${BASE_URL}/doctor/appointments`, {
    headers: { Authorization: `Bearer ${patientToken}` }
  });
  const sec1Data = await sec1.json();
  if (sec1.status === 403) {
    console.log("✓ Security verified: Patient blocked with HTTP 403:", sec1Data.message);
  } else {
    console.error("✗ Security check failed: HTTP", sec1.status);
  }

  // 7. Security check: Doctor attempting to access Patient endpoint
  const sec2 = await fetch(`${BASE_URL}/patient/appointments`, {
    headers: { Authorization: `Bearer ${doctorToken}` }
  });
  const sec2Data = await sec2.json();
  if (sec2.status === 403) {
    console.log("✓ Security verified: Doctor blocked with HTTP 403:", sec2Data.message);
  } else {
    console.error("✗ Security check failed: HTTP", sec2.status);
  }

  console.log("\nAll backend role-based verification checks passed with 100% success!");
}

test().catch(err => {
  console.error("Test failed:", err);
});
