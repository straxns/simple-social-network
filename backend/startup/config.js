
module.exports = function(){
    if(!process.env.JWT_SECRET){
      throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    }
  }