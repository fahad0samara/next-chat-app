"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { CheckCircle, RadioButtonUnchecked,
  cercat

 } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [name, setName] = useState("");

  const { data: session } = useSession();
  const currentUser = session?.user;
  const isGroup = selectedContacts.length > 1;
  const router = useRouter();

  const getContacts = async () => {
    try {
      const res = await fetch(
        search !== "" ? `/api/users/searchContact/${search}` : "/api/users"
      );
      const data = await res.json();
      setContacts(data.filter((contact) => contact._id !== currentUser._id));
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (currentUser) getContacts();
  }, [currentUser, search]);

  const handleSelect = (contact) => {
    setSelectedContacts((prevSelectedContacts) => {
      if (prevSelectedContacts.includes(contact)) {
        return prevSelectedContacts.filter((item) => item !== contact);
      } else {
        return [...prevSelectedContacts, contact];
      }
    });
  };

  const createChat = async () => {
    const res = await fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({
        currentUserId: currentUser._id,
        members: selectedContacts.map((contact) => contact._id),
        isGroup,
        name,
      }),
    });
    const chat = await res.json();

    if (res.ok) {
      router.push(`/chats/${chat._id}`);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="create-chat-container">
      <input
        placeholder="Search contact..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="contact-bar">
        <div className="contact-list">
          <p className="text-body-bold">Select or Deselect</p>

          <div className="flex flex-col flex-1 gap-5 overflow-y-scroll custom-scrollbar">
            {contacts.map((user, index) => (
              <div
                key={index}
                className={`contact ${selectedContacts.includes(user) ? "selected" : ""}`}
                onClick={() => handleSelect(user)}
              >
                {selectedContacts.includes(user) ? (
                  <CheckCircle className="check-icon" />
                ) : (
                  <RadioButtonUnchecked className="uncheck-icon" />
                )}
                <img
                  src={user.profileImage || "/assets/person.jpg"}
                  alt="profile"
                  className="profilePhoto"
                />
                <p className="text-base-bold">{user.username}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="create-chat">
          {isGroup && (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-body-bold">Group Chat Name</p>
                <input
                  placeholder="Enter group chat name..."
                  className="input-group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-body-bold">Members</p>
                <div className="flex flex-wrap gap-3">
                  {selectedContacts.map((contact, index) => (
                    <p className="selected-contact" key={index}>
                      {contact.username}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
          <button
            className={`btn ${selectedContacts.length === 0 ? "disabled" : ""}`}
            onClick={createChat}
            disabled={selectedContacts.length === 0}
          >
             {isGroup ? "Create Group Chat" : "Create Chat"}
          
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
