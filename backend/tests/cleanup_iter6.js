var p = db.channel_partners.deleteMany({name: /^TEST_/});
print('partners deleted: ' + p.deletedCount);
var t = db.cam_templates.deleteMany({name: /^TEST_/});
print('templates deleted: ' + t.deletedCount);
var c = db.clients.deleteMany({name: /^TEST_QA/});
print('clients deleted: ' + c.deletedCount);
print('remaining cam_templates:');
db.cam_templates.find({}, {name:1, product:1, _id:0}).forEach(printjson);
