var u = db.users.findOne({email:'corpzoindia@gmail.com'});
print('super user_id: ' + (u && u.user_id));
db.user_sessions.deleteMany({session_token:'test_session_supertoken'});
db.user_sessions.insertOne({user_id:u.user_id, session_token:'test_session_supertoken', expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString(), created_at:new Date().toISOString()});

db.users.updateOne({email:'TEST_agent@corpzo.example'}, {$set:{user_id:'user_test_agent_qa', email:'TEST_agent@corpzo.example', name:'TEST QA Agent', role:'sales_agent', active:true, picture:'', permissions_grants:[], permissions_revokes:[], created_at:new Date().toISOString()}}, {upsert:true});
db.user_sessions.deleteMany({session_token:'test_session_agent_qa'});
db.user_sessions.insertOne({user_id:'user_test_agent_qa', session_token:'test_session_agent_qa', expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString(), created_at:new Date().toISOString()});

print('cam_templates count: ' + db.cam_templates.countDocuments({}));
db.cam_templates.find({}, {template_id:1, name:1, product:1, _id:0}).forEach(printjson);
printjson(db.cases.findOne({case_uid:'CS-2026-000015'}, {product:1, case_uid:1, _id:0}));
print('batches:');
db.payout_batches.find({}, {batch_id:1, status:1, _id:0}).limit(5).forEach(printjson);
