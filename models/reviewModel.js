const mongoose = require('mongoose');

const reviewSchma = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belongs to tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchma.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

const Review = mongoose.model('Review', reviewSchma);
module.exports = Review;