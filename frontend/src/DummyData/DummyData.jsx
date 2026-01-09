export const dummyUsers = [
  {
    _id: "u1",
    fullName: "Aarav Sharma",
    profilePic: "https://i.pravatar.cc/150?img=1",
    lastMessage: "Did you push the changes?",
    unreadCount: 2,
    isFavourite: true,
    isGroup: false,
  },
  {
    _id: "u2",
    fullName: "Neha Verma",
    profilePic: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Meeting at 6 PM",
    unreadCount: 0,
    isFavourite: false,
    isGroup: false,
  },
  {
    _id: "u3",
    fullName: "Frontend Team",
    profilePic: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Rahul: Navbar looks 🔥",
    unreadCount: 5,
    isFavourite: true,
    isGroup: true,
  },
];

export const dummyMessages = {
  u1: [
    {
      _id: "m1",
      senderId: "u1",
      text: "Hey!",
      createdAt: new Date(),
    },
    {
      _id: "m2",
      senderId: "me",
      text: "Yeah, pushing now.",
      createdAt: new Date(),
    },
  ],
  u2: [
    {
      _id: "m3",
      senderId: "u2",
      text: "Are you joining the call?",
      createdAt: new Date(),
    },
  ],
  u3: [
    {
      _id: "m4",
      senderId: "u3",
      text: "Please review PR #42",
      createdAt: new Date(),
    },
  ],
};
