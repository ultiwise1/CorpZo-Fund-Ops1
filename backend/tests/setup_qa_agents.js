var names = ['ov','rc','cp','cam','ro'];
names.forEach(function (n) {
  var uid = 'user_test_agent_' + n;
  var tok = 'test_session_agent_' + n;
  db.users.updateOne({user_id: uid}, {$set: {
    user_id: uid, email: 'TEST_agent_' + n + '@corpzo.example',
    name: 'TEST QA Agent ' + n.toUpperCase(), role: 'sales_agent', active: true,
    picture: '', permissions_grants: [], permissions_revokes: [],
    created_at: new Date().toISOString()}}, {upsert: true});
  db.user_sessions.deleteMany({session_token: tok});
  db.user_sessions.insertOne({user_id: uid, session_token: tok,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()});
  print('ready: ' + uid + ' / ' + tok);
});
