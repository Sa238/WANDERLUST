const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");



    // index route
    router.get("/",  wrapAsync(async (req, res) => {
        let allListings = await Listing.find({});
        res.render("listings/index.ejs" , { allListings });
    }));

    //New Route
    router.get("/new", isLoggedIn ,(req, res) => {
        res.render("listings/new.ejs");
    });

    // show route
    router.get("/:id", wrapAsync(async (req, res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {path: "author",  
            },
        })
        .populate("owner");
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs", {listing});
    }));

    // Create Route
    router.post("/", isLoggedIn, 
            wrapAsync(async (req, res, next) => {
            const newListing = new Listing(req.body.listing);
            newListing.owner = req.user._id;
            await newListing.save();
            req.flash("success", "New listing created!");
            res.redirect("/listings");
    }));

    // Edit route
    router.get("/:id/edit", isLoggedIn,  wrapAsync(async (req, res) => {
        let {id} = req.params;
        const listing = await Listing.findById(id);
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing });
    }));

    // Update Route
    router.put("/:id", isLoggedIn,isOwner ,
        wrapAsync(async (req, res) => {
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});
        req.flash("success", "updated successfully!");
        res.redirect(`/listings/${id}`);
    }));

    // Delete Route
    router.delete("/:id", isLoggedIn, isOwner , wrapAsync(async (req, res) => {
        let {id} = req.params;
        let deleteListing = await Listing.findByIdAndDelete(id);
        console.log(deleteListing);
        req.flash("success", "listing deleted!");
        res.redirect("/listings");
    }));

    module.exports = router;