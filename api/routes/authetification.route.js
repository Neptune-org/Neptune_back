const express = require("express");
var bcrypt = require("bcrypt");
const User = require("../models/Users");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Register new User
router.post("/register", async (req, res) => {
  const usercheck = await User.findOne({ email: req.body.email });
  if (usercheck !== null) {
    return res.status(400).json({ message: "E-mail exists" });
  }
  const hashedpassword = await bcrypt.hash(req.body.password, 10);
  const myuser = req.body;
  myuser.password = hashedpassword;
  const registreduser = await User.create(myuser);
  res.json(registreduser);
});

router.post("/login", async (req, res, err) => {
  const myuser = await User.findOne({ email: req.body.email }).populate(
    "graveyard"
  );
//console.log(myuser)
  const non = {
    error: {
      code: 401,
      message: "EMAIL_NOT_FOUND",
      errors: [
        {
          message: "EMAIL_NOT_FOUND",
          domain: "global",
          reason: "invalid",
        },
      ],
    },
  };
  if (
    myuser !== null &&
    bcrypt.compareSync(req.body.password, myuser.password)
  ) {
    let tokendata;
    if (myuser.userimage)
      tokendata = {
        email: myuser.email,
        name: myuser.name,
        image: myuser.userimage,
        lastname: myuser.lastn,
        userId: myuser._id,
        role: myuser.role,
        graveyardName: myuser?.graveyard?.name,
        graveyardId: myuser?.graveyard?._id,
      };
    else
      tokendata = {
        email: myuser.email,
        name: myuser.name,
        image: "avatar.jpg",
        lastname: myuser.lastn,
        userId: myuser._id,
        role: myuser.role,
        graveyardName: myuser?.graveyard?.name,
        graveyardId: myuser?.graveyard?._id,
      };
    const createdToken = jwt.sign(tokendata, process.env.SECRET, {
      expiresIn: "6h",
    });

    const k = {
      kind: "identitytoolkit#VerifyPasswordResponse",
      localId: myuser._id,
      email: myuser.email,
      role: myuser.role,
      displayName: "",
      idToken: createdToken,
      registered: true,
      expiresIn: "255000",
      expireDate: "2022-12-18T14:48:03.833Z",
    };
    // 2. send response

    return res.status(200).json(k);
  } else {
    return res.status(401).send(non);
  }
});

// Login new User

module.exports = router;
