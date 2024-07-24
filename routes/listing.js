const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


router
.route("/")
.get(wrapAsync(listingControllers.index))
.post(isLoggedIn, validateListing,
    wrapAsync(listingControllers.createListing)
);
// .post((req, res) => {
//     res.send(req.body);
// });

 //New Route
 router.get("/new", isLoggedIn ,listingControllers.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingControllers.showListing))
.put(isLoggedIn,isOwner ,
    wrapAsync(listingControllers.updateListing))
.delete(isLoggedIn, isOwner ,
    wrapAsync(listingControllers.deleteListing)
);

    // Edit route
    router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingControllers.renderEditForm));

    module.exports = router;