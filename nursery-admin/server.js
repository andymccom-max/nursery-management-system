const http = require('http');

const PORT = process.env.PORT || 4000;

let staff = [
  { _id: '1', name: 'Emma Johnson', role: 'Nursery Manager', hourlyRate: 18, normalSchedule: { Monday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' }, Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' } }, address: '', contactDetails: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', qualificationLevel: '' },
  { _id: '2', name: 'Daniel Smith', role: 'Early Years Practitioner', hourlyRate: 15, normalSchedule: { Monday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' }, Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' } }, address: '', contactDetails: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', qualificationLevel: '' },
  { _id: '3', name: 'Sophia Lee', role: 'Room Leader', hourlyRate: 16, normalSchedule: { Monday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '09:00', endTime: '17:00' }, Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' }, Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' } }, address: '', contactDetails: '', emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '', qualificationLevel: '' },
];

let children = [
  { _id: '1', name: 'Liam Brown', room: 'Flowers', dob: '2022-09-14T00:00:00.000Z', normalSchedule: { Monday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '08:00', endTime: '17:00' } } },
  { _id: '2', name: 'Ava Wilson', room: 'Flowers', dob: '2021-11-03T00:00:00.000Z', normalSchedule: { Monday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '08:00', endTime: '17:00' } } },
  { _id: '3', name: 'Noah Taylor', room: 'Buds', dob: '2023-01-22T00:00:00.000Z', normalSchedule: { Monday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Thursday: { enabled: true, startTime: '08:00', endTime: '17:00' }, Friday: { enabled: true, startTime: '08:00', endTime: '17:00' } } },
];

let rooms = [
  { _id: '1', name: 'Seeds' },
  { _id: '2', name: 'Buds' },
  { _id: '3', name: 'Flowers' },
];

let parents = [
  { _id: '1', name: 'Olivia Brown', relationship: 'Mother', email: 'olivia@example.com', phone: '07700 900123', address: '', postcode: '', other: '' },
  { _id: '2', name: 'James Wilson', relationship: 'Father', email: 'james@example.com', phone: '07700 900456', address: '', postcode: '', other: '' },
  { _id: '3', name: 'Mia Taylor', relationship: 'Mother', email: 'mia@example.com', phone: '07700 900789', address: '', postcode: '', other: '' },
];

let rosterShifts = [];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (url === '/staff' && method === 'GET') {
    sendJson(res, 200, staff);
    return;
  }

  if (url === '/roster' && method === 'GET') {
    sendJson(res, 200, rosterShifts);
    return;
  }

  const rosterShiftIdMatch = url.match(/^\/roster\/([^/]+)$/);
  if (rosterShiftIdMatch && method === 'DELETE') {
    const shiftId = decodeURIComponent(rosterShiftIdMatch[1]);
    const shiftIndex = rosterShifts.findIndex(shift => shift.id === shiftId);

    if (shiftIndex === -1) {
      sendJson(res, 404, { message: 'Roster shift not found' });
      return;
    }

    const [deletedShift] = rosterShifts.splice(shiftIndex, 1);
    sendJson(res, 200, deletedShift);
    return;
  }

  if (rosterShiftIdMatch && method === 'PUT') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const shift = JSON.parse(body || '{}');
        const shiftId = decodeURIComponent(rosterShiftIdMatch[1]);
        const shiftIndex = rosterShifts.findIndex(item => item.id === shiftId);
        const savedShift = { ...shift, id: shiftId };

        if (shiftIndex === -1) {
          rosterShifts.push(savedShift);
        } else {
          rosterShifts[shiftIndex] = savedShift;
        }

        sendJson(res, 200, savedShift);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid roster shift payload' });
      }
    });
    return;
  }

  const staffDetailsIdMatch = url.match(/^\/staff\/([^/]+)$/);
  if (staffDetailsIdMatch && method === 'GET') {
    const staffMember = staff.find(item => item._id === decodeURIComponent(staffDetailsIdMatch[1]));

    if (!staffMember) {
      sendJson(res, 404, { message: 'Staff member not found' });
      return;
    }

    sendJson(res, 200, staffMember);
    return;
  }

  const staffDeleteIdMatch = url.match(/^\/staff\/([^/]+)$/);
  if (staffDeleteIdMatch && method === 'DELETE') {
    const staffIndex = staff.findIndex(staffMember => staffMember._id === decodeURIComponent(staffDeleteIdMatch[1]));

    if (staffIndex === -1) {
      sendJson(res, 404, { message: 'Staff member not found' });
      return;
    }

    const [deletedStaff] = staff.splice(staffIndex, 1);
    sendJson(res, 200, deletedStaff);
    return;
  }

  if (url === '/children' && method === 'GET') {
    sendJson(res, 200, children);
    return;
  }

  if (url === '/rooms' && method === 'GET') {
    sendJson(res, 200, rooms);
    return;
  }

  if (url === '/rooms' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const newRoom = JSON.parse(body || '{}');
        const room = { _id: String(Date.now()), name: newRoom.name };
        rooms.push(room);
        sendJson(res, 201, room);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid room payload' });
      }
    });
    return;
  }

  const roomIdMatch = url.match(/^\/rooms\/([^/]+)$/);
  if (roomIdMatch && method === 'PUT') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const roomIndex = rooms.findIndex(room => room._id === decodeURIComponent(roomIdMatch[1]));
        if (roomIndex === -1) {
          sendJson(res, 404, { message: 'Room not found' });
          return;
        }
        rooms[roomIndex] = { ...rooms[roomIndex], ...JSON.parse(body || '{}') };
        sendJson(res, 200, rooms[roomIndex]);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid room payload' });
      }
    });
    return;
  }

  if (roomIdMatch && method === 'DELETE') {
    const roomIndex = rooms.findIndex(room => room._id === decodeURIComponent(roomIdMatch[1]));
    if (roomIndex === -1) {
      sendJson(res, 404, { message: 'Room not found' });
      return;
    }
    const [deletedRoom] = rooms.splice(roomIndex, 1);
    sendJson(res, 200, deletedRoom);
    return;
  }

  const childIdMatch = url.match(/^\/children\/([^/]+)$/);
  if (childIdMatch && method === 'GET') {
    const child = children.find(item => item._id === decodeURIComponent(childIdMatch[1]));

    if (!child) {
      sendJson(res, 404, { message: 'Child not found' });
      return;
    }

    sendJson(res, 200, child);
    return;
  }

  if (childIdMatch && method === 'DELETE') {
    const childIndex = children.findIndex(child => child._id === decodeURIComponent(childIdMatch[1]));

    if (childIndex === -1) {
      sendJson(res, 404, { message: 'Child not found' });
      return;
    }

    const [deletedChild] = children.splice(childIndex, 1);
    sendJson(res, 200, deletedChild);
    return;
  }

  if (childIdMatch && method === 'PUT') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updates = JSON.parse(body || '{}');
        const childIndex = children.findIndex(child => child._id === decodeURIComponent(childIdMatch[1]));

        if (childIndex === -1) {
          sendJson(res, 404, { message: 'Child not found' });
          return;
        }

        children[childIndex] = { ...children[childIndex], ...updates };
        sendJson(res, 200, children[childIndex]);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid child payload' });
      }
    });
    return;
  }

  if (url === '/parents' && method === 'GET') {
    sendJson(res, 200, parents);
    return;
  }

  if (url === '/parents' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newParent = JSON.parse(body || '{}');
        const parent = {
          _id: String(Date.now()),
          name: newParent.name,
          relationship: newParent.relationship,
          email: newParent.email,
          phone: newParent.phone,
          address: newParent.address,
          postcode: newParent.postcode,
          other: newParent.other,
        };

        parents.push(parent);
        sendJson(res, 201, parent);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid parent payload' });
      }
    });
    return;
  }

  const parentIdMatch = url.match(/^\/parents\/([^/]+)$/);
  if (parentIdMatch && method === 'DELETE') {
    const parentIndex = parents.findIndex(parent => parent._id === decodeURIComponent(parentIdMatch[1]));

    if (parentIndex === -1) {
      sendJson(res, 404, { message: 'Parent not found' });
      return;
    }

    const [deletedParent] = parents.splice(parentIndex, 1);
    sendJson(res, 200, deletedParent);
    return;
  }

  if (parentIdMatch && method === 'PUT') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updates = JSON.parse(body || '{}');
        const parentIndex = parents.findIndex(parent => parent._id === decodeURIComponent(parentIdMatch[1]));

        if (parentIndex === -1) {
          sendJson(res, 404, { message: 'Parent not found' });
          return;
        }

        parents[parentIndex] = { ...parents[parentIndex], ...updates };
        sendJson(res, 200, parents[parentIndex]);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid parent payload' });
      }
    });
    return;
  }

  if (url === '/staff' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newStaff = JSON.parse(body || '{}');
        const staffMember = {
          _id: String(Date.now()),
          name: newStaff.name,
          role: newStaff.role,
          hourlyRate: Number(newStaff.hourlyRate) || 0,
          normalSchedule: newStaff.normalSchedule || {},
          address: newStaff.address,
          contactDetails: newStaff.contactDetails,
          emergencyContactName: newStaff.emergencyContactName,
          emergencyContactPhone: newStaff.emergencyContactPhone,
          emergencyContactRelationship: newStaff.emergencyContactRelationship,
          qualificationLevel: newStaff.qualificationLevel,
        };

        staff.push(staffMember);
        sendJson(res, 201, staffMember);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid staff payload' });
      }
    });
    return;
  }

  const staffIdMatch = url.match(/^\/staff\/([^/]+)$/);
  if (staffIdMatch && method === 'PUT') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updates = JSON.parse(body || '{}');
        const staffIndex = staff.findIndex(staffMember => staffMember._id === decodeURIComponent(staffIdMatch[1]));

        if (staffIndex === -1) {
          sendJson(res, 404, { message: 'Staff member not found' });
          return;
        }

        staff[staffIndex] = {
          ...staff[staffIndex],
          ...updates,
          hourlyRate: Number(updates.hourlyRate) || 0,
        };
        sendJson(res, 200, staff[staffIndex]);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid staff payload' });
      }
    });
    return;
  }

  if (url === '/children' && method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newChild = JSON.parse(body || '{}');
        const child = {
          _id: String(Date.now()),
          name: newChild.name,
          dob: newChild.dob,
          room: newChild.room,
          normalSchedule: newChild.normalSchedule || {},
        };

        children.push(child);
        sendJson(res, 201, child);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid child payload' });
      }
    });
    return;
  }

  if (url === '/api/health') {
    sendJson(res, 200, { status: 'ok', message: 'Nursery admin API is running.' });
    return;
  }

  sendJson(res, 200, {
    message: 'Nursery admin server is running.',
    routes: ['/staff', '/children', '/parents', '/api/health'],
    port: PORT,
  });
});

server.listen(PORT, () => {
  console.log(`Nursery admin server running on http://localhost:${PORT}`);
});
