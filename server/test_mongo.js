import mongoose from 'mongoose';

const uri = "mongodb://afrozraj75_db_user:AfrozRaj7518@ac-ayxt7tw-shard-00-00.juvalmt.mongodb.net:27017,ac-ayxt7tw-shard-00-01.juvalmt.mongodb.net:27017,ac-ayxt7tw-shard-00-02.juvalmt.mongodb.net:27017/?ssl=true&replicaSet=atlas-ayxt7tw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Ai-Social-Media";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully to non-SRV URI");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
