const Album = require("./../models/album");
const Insect = require("./../models/insect");
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
    const page = +req.query.page;
    const itemsPerPage = +req.query.itemsPerPage;
    albumList = await Album.find({ _user: req.user.id })
      .skip(page * itemsPerPage)
      .limit(itemsPerPage);
  }
  console.log("album list length:", albumList?.length);
  return res.send({
    message: true,
    albumList: albumList,
    totalCount: totalCount,
  });
});

exports.sharedList = catchAsync(async (req, res, next) => {
  console.log("album shared list");
  let totalCount;
  let albumList;
  let album;
  if (req.query.sharedAlbumId) {
    album = await (
      await Album.findOne({ _id: req.query.sharedAlbumId })
    ).populate("insects");
    if (!album) {
      return res.status(404).send({ msg: 'Couldn"t find shared album.' });
    }
    totalCount = 1;
    albumList = [album];
  } else {
    totalCount = await Album.find({ shared: true }).count();
    console.log("totalCount: " + totalCount);
    const page = +req.query.page;
    const itemsPerPage = +req.query.itemsPerPage;
    if (totalCount > 0) {
      albumList = await Album.find({ shared: true })
        .skip(page * itemsPerPage)
        .limit(itemsPerPage)
        .populate("insects");
    } else {
      return res.status(404).send({ msg: "No shared albums found." });
    }
    console.log("album list length:", albumList?.length);
  }
  return res.send({
    msg: true,
    albumList: albumList,
    totalCount: totalCount,
  });
});

exports.view = catchAsync(async (req, res, next) => {
  console.log("album view");
  const album = await Album.findOne({ _id: req.query.albumId });

  if (!album) {
    return res.status(404).send({ message: "no album found", album: null });
  }
  const totalCount = album.insects.length;
  console.log("totalCount:", totalCount);
  const page = +req.query.page;
  const itemsPerPage = +req.query.itemsPerPage;

  const insectIds = album.insects.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );
  console.log("insectids:", insectIds);
  const insects = await Insect.find({ _id: { $in: insectIds } });
  console.log("insects.length: ", insects.length);

  return res
    .status(200)
    .send({ message: true, insects: insects, totalCount: totalCount });
});

exports.viewShared = catchAsync(async (req, res, next) => {
  console.log("album shared view");
  const album = await Album.findOne({
    _id: req.query.albumId,
    shared: true,
  });

  if (!album) {
    return res.status(404).send({ message: false, album: null });
  }
  console.log("album.insects.length: ", album.insects.length);
  const page = +req.query.page;
  const itemsPerPage = +req.query.itemsPerPage;

  const totalCount = album.insects.length;
  const insectIds = album.insects.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );
  const insects = await Insect.find({ _id: { $in: insectIds } });
  console.log("insects.length: ", insects.length);

  return res
    .status(200)
    .send({ message: true, insects: insects, totalCount: totalCount });
});

exports.delete = catchAsync(async (req, res, next) => {
  console.log("album delete");
  const album = await Album.findByIdAndDelete(req.query.id);
  console.log("album: ", album);
  if (!album) {
    return next(new AppError("No document found with that ID", 404));
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.toggleShare = catchAsync(async (req, res, next) => {
  console.log("ShareAlbum");
  console.log("albumid:", req.query.albumId);
  const album = await Album.updateOne(
    { _id: req.query.albumId },
    { $set: { shared: req.query.share } }
  );
  return res.status(200).send({ msg: true });
});
