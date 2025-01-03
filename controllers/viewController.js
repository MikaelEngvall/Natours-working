const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successfully please check your email for a confirmation, If your booking doesn't show up here immediately, please come back later. ";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render that template using data from data 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour (reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  // 2) Build template

  // 3) Render template using data from 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getManageTours = async (req, res, next) => {
  try {
    const tours = await Tour.find(); // Fetch all tours from the database
    res.status(200).render('manage-tours', {
      title: 'Manage Tours',
      user: req.user, // Pass user info for navigation
      tours // Pass the tours to the template
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to load tours' });
  }
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with the return IDs
  // get all tourId through array of bookings
  const tourIDs = bookings.map(el => el.tour);
  // select all the tour which have an id in tourIDs array
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getManageReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user')
      .populate('tour'); // Fetch reviews with user and tour data
    res.status(200).render('manage-reviews', {
      title: 'Manage Reviews',
      user: req.user, // Pass user info for navigation
      reviews // Pass the reviews to the template
    });
  } catch (err) {
    res
      .status(500)
      .json({ status: 'error', message: 'Failed to load reviews' });
  }
};
