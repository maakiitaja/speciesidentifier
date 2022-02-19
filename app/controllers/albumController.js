const Album = require("./../models/album");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.add = catchAsync(async (req, res, next) => {
  console.log("creating a new album");
  const newAlbum = new Album();
  console.log("user: ", req.user.id);
  console.log("cover:", req.query.coverImage);
  console.log("name: ", req.query.name);
  newAlbum._user = req.user.id;
  newAlbum.insects = req.query.insects;
  newAlbum.coverImage = req.query.coverImage;
  newAlbum.name = req.query.name;
  const album = await newAlbum.save();
  console.log("saved album: ", album);

  res.send({ message: "Saved album successfully. Redirecting..." });
});

exports.list = catchAsync(async (req, res, next) => {
  console.log("album list");
  const totalCount = await Album.find({ _user: req.user.id }).count();
  let albumList;
  if (totalCount > 0) {
    albumList = await Album.find({ _user: req.user.id })
      .skip(req.query.page * req.query.itemsPerPage)
      .limit(req.query.itemsPerPage);
  }
  console.log("album list length:", albumList?.length);
  return res.send({
    message: true,
    albumList: albumList,
    totalCount: totalCount,
  });
});

exports.view = catchAsync(async (req, res, next) => {
  console.log("album view");
  const album = await Album.findOne({ _id: req.query.id }).populate("insects");
  console.log("album: ", album);
  res.send({ message: true, album: album });
});

exports.delete = catchAsync(async (req, res, next) => {
  console.log("album delete");
  const album = await Album.findByIdAndDelete(req.query.id);
  console.log("album: ", album);
  if (!album) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
