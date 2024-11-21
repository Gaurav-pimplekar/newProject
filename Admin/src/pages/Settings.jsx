import React, { useState } from "react";
import "../styles/settings.css";

const Settings = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    liveIn: "Pune, Maharatra",
    street: "kharadi 411014",
    email: "worldtriplink@gmail.com",
    phoneNumber: "+91 9096212076",
    gender: "Male",
    photo: null,
    password: "**********", // Added password field
  });

  // State to manage the edit mode (enabled/disabled)
  const [isEditable, setIsEditable] = useState(false);

  // Handle changes in the form fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] }); // Store the selected file
    } else {
      setFormData({ ...formData, [name]: value }); // Store the input values
    }
  };

  // Toggle the edit mode (enable/disable fields)
  const handleEdit = () => {
    setIsEditable(!isEditable); // Toggle between read-only and editable
  };

  // Handle form submission
  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("Updated data:", formData);
    alert("Profile updated successfully!");
  };

  return (
    <div className="settings">
      <div className="settings__wrapper">
        <div className="details__form">
          <h2 className="profile__title">Profile</h2>
          <p className="profile__desc">
            Update your photo and personal details here
          </p>
          <form onSubmit={handleUpdate}>
            <div className="form__group">
              <div>
                <label>Live in</label>
                <input
                  type="text"
                  name="liveIn"
                  value={formData.liveIn}
                  onChange={handleChange}
                  disabled={!isEditable} // Disable input when not in edit mode
                />
              </div>

              <div>
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="form__group">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div className="form__group">
              <div>
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              <div> 
                <label>Password</label> {/* Added Password Field */}
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={!isEditable} // Disable input when not in edit mode
                />
              </div>
            </div>

            <div className="form__group">
              <div>
                <label>Your Photo</label>
                <p className="profile-img__desc">
                  This will be displayed in your profile
                </p>
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  disabled={!isEditable}
                />
              </div>

              <div className="profile__img-btns">
                {formData.photo && (
                  <button
                    type="button"
                    className="dlt__btn"
                    onClick={() => setFormData({ ...formData, photo: null })}
                  >
                    Delete
                  </button>
                )}
                <button type="button" className="update__btn" onClick={handleEdit}>
                  {isEditable ? "Save" : "Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
