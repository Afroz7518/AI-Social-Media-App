import mongoose from 'mongoose';

const uri = "mongodb://afrozraj75_db_user:AfrozRaj7518@ac-ayxt7tw-shard-00-00.juvalmt.mongodb.net:27017,ac-ayxt7tw-shard-00-01.juvalmt.mongodb.net:27017,ac-ayxt7tw-shard-00-02.juvalmt.mongodb.net:27017/?ssl=true&replicaSet=atlas-ayxt7tw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Ai-Social-Media";

mongoose.connect(uri, { family: 6 })
  .then(() => {
    console.log("IPv6: Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("IPv6: Connection error:", err.message);
    process.exit(1);
  });
