// call 실행
const callAccess = require('./call_module/call')
const mirrorDB = require('./mirror_db')

callAccess.setCall(mirrorDB.getMirror_id(), null)


