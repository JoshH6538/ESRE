const BASE_URL = 'https://esreapi.onrender.com/api/realtors';

export async function findRealtorById(id) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'findRealtor',
      _id: { $oid: id }
    })
  });

  const data = await response.json();
  return data;
}

export async function allRealtors() {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'allRealtors'
    })
  });

  const data = await response.json();
  return data;
}