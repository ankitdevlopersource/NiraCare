const http = require('http');
const data = JSON.stringify({
    userId:'test',
    hospitalId:'0001',
    hospitalName:'Test Hospital',
    patientName:'Ankit Kumar',
    aadharNumber:'789654123012',
    mobileNumber:'7896541230',
    email:'ankit@example.com',
    patientType:'Critical',
    address:'XYZ street',
    bedType:'General'
});
const opts={
    hostname:'localhost',
    port:3000,
    path:'/api/bookings',
    method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}
};
const req=http.request(opts,res=>{
    let d='';
    res.on('data', c=> d += c);
    res.on('end', ()=> console.log('status', res.statusCode, d));
});
req.on('error', e=> console.error('req err',e));
req.write(data);
req.end();
