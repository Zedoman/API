import React, { useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiUserLine } from "react-icons/ri";
import { IoIosClose } from "react-icons/io";
import Modal from "react-modal";
import Profile from "../auth/Profile";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";

Modal.setAppElement("#root");



const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const menuRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsSignedUp(!!user);


    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const handleProfile = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleSignup = () => {
    setIsSignedUp(true);
    localStorage.setItem("user", "true");
    setIsProfileModalOpen(false);
  };



  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  

 

  useEffect(() => {
    setIsMenuOpen(false); // Close the menu on page navigation
  }, [navigate]);

  return (
    <>
      <div>
        <div className="bg-white h-[51px] flex relative items-center justify-between px-4 md:px-12 gap-2 border-b border-black-500 z-50">
          <button className="text-lg md:hidden" onClick={toggleMenu}>
            <GiHamburgerMenu />
          </button>
          <div className="flex items-center gap-4">
            <Link to="/">
              <h1>MUTAENGINE</h1>
            </Link>
          </div>
          {/* Conditionally render links and search bar based on the current path */}
          
          <div className="flex gap-6">
            
            <button className="hidden md:block text-lg mb-1" onClick={handleProfile}>
              <RiUserLine />
            </button>
          </div>
        </div>
        {/* Code for the large desktop version */}
        <div>
          {/* mobile section */}
          <nav
            ref={menuRef}
            className={`fixed top-0 left-0 w-64 h-full bg-white z-50 transition-transform transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
              } md:hidden`}
          >
            <div className="flex flex-col p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={toggleMenu}>
                  <IoIosClose className="text-2xl" />
                </button>
              </div>
              
            </div>
          </nav>
        </div>
        <Modal
          isOpen={isProfileModalOpen}
          onRequestClose={closeProfileModal}
          contentLabel="Profile Modal"
          className="modal"
          overlayClassName="overlay"
        >
          <Profile onClose={closeProfileModal} onSignup={handleSignup} />
        </Modal>

        
      </div>
    </>
  );
};

export default Navbar;