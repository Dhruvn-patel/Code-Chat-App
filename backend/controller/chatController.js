const Chat = require("../model/chatModel");
const User = require("../model/userModel");

//POST Chat data
const accessChat = async (req, res) => {
    // whose user Chat with logind user
    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    // one on one single chat 
    var isChat = await Chat.find({
        isGroupChat: false, //grp chat false
        $and: [{ users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password")
        .populate("latestMsg");


    //sender message model get name pic,email (sender Detailss)
    isChat = await User.populate(isChat, {
        path: "latestMsg.sender",
        select: "name pic email",
    })

    if (isChat.length > 0) {
        res.send(isChat[0]);
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            //first time chat create chat and store into full chat
            //create chat store in paritcular fullchat
            const createChat = await Chat.create(chatData);
            const fullchat = await Chat.findOne({ _id: createChat._id }).populate("users", "-password")
            res.status(200).json(fullchat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);

        }
    }

}


// fetchchat Get 
const fetchChat = async (req, res) => {
    try {

        // find inside chat of users check userId matches
        Chat.find({
            users: {
                $elemMatch: {
                    $eq
                        : req.user._id
                }
            }
            // sorting
        }).populate("users", "-password").populate("groupAdmin", "-password").populate("latestMsg").
            sort({ updatedAt: -1 }).
            then(async (result) => {
                // send match users details and result gives path and details
                result = await User.populate(result, {
                    path: "latestMsg.sender",
                    select: "name pic email",
                });
                res.status(200).send(result);
            })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

//resume
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the feilds" });
    }

    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        //group inside chat get all users
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }

}


const renameGroup = (async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: chatName,
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

const removeFromGroup = (async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
});

const addToGroup = (async (req, res) => {
    const { chatId, userId } = req.body;

    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId },
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});
module.exports = { accessChat, fetchChat, createGroupChat, renameGroup, removeFromGroup, addToGroup }