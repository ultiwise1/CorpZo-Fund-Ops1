// Removes TEST_QA seeded-by-tests entities and their children (run: mongosh test_database cleanup_test_data.js)
var leads = db.leads.find({name: /TEST_QA/}).toArray().map(l => l.lead_uid);
var clients = db.clients.find({name: /TEST_QA/}).toArray().map(c => c.client_uid);
var cases = db.cases.find({client_uid: {$in: clients}}).toArray().map(c => c.case_uid);
var apps = db.applications.find({case_uid: {$in: cases}}).toArray().map(a => a.application_uid);
var sanctions = db.sanctions.find({case_uid: {$in: cases}}).toArray().map(s => s.sanction_uid);

db.leads.deleteMany({lead_uid: {$in: leads}});
db.clients.deleteMany({client_uid: {$in: clients}});
db.cases.deleteMany({case_uid: {$in: cases}});
db.applications.deleteMany({application_uid: {$in: apps}});
db.sanctions.deleteMany({sanction_uid: {$in: sanctions}});
db.disbursements.deleteMany({sanction_uid: {$in: sanctions}});
db.documents.deleteMany({client_uid: {$in: clients}});
db.bureau_checks.deleteMany({client_uid: {$in: clients}});
db.mandates.deleteMany({client_uid: {$in: clients}});
db.invoices.deleteMany({client_uid: {$in: clients}});
db.payments.deleteMany({client_uid: {$in: clients}});
db.pds.deleteMany({case_uid: {$in: cases}});
db.lender_queries.deleteMany({case_uid: {$in: cases}});
db.activities.deleteMany({entity_id: {$in: leads.concat(clients).concat(cases)}});
db.tasks.deleteMany({title: /TEST_QA/});
print("cleaned leads=" + leads.length + " clients=" + clients.length + " cases=" + cases.length);
