exports.getIndex = function (req, res) {
  console.log("hello from getIndex");
  res.sendFile("index.html");
};
