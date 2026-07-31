"use client";

import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const inputStyle = {
  "& input::-webkit-outer-spin-button,\n input::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: "0",
  },
  width: "100%",
  "& .css-hfutr2-MuiSvgIcon-root-MuiSelect-icon": {
    color: "#000",
  },
  "& .css-bpeome-MuiSvgIcon-root-MuiSelect-icon": {
    color: "#000",
  },

  "& .MuiOutlinedInput-root": {
    background: "#f0f0f0",

    "& fieldset": {
      border: "1px solid #fff",
    },
    "&:hover fieldset": {
      border: "1px solid #fff",
    },
    "&.Mui-focused fieldset": {
      border: "1px solid #fff",
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#253A47", // Change this to the desired placeholder color
    },
    color: "#000",
    height: "50px",
    borderRadius: "99px",
    fontFamily: "Inter",
  },
};

const CustomInput = (props) => {
  return <TextField {...props} sx={inputStyle} size="small" />;
};

export default CustomInput;

export const CustomField = ({
  placeholder,

  // amount,
  image,
  readOnly,
  value,
  name,
  onChange,
}) => {
  return (
    <CustomInput
      type="text"
      placeholder={placeholder}
      onChange={onChange}
      name={name}
      value={value}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton>
              <SearchIcon sx={{ color: "#000" }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};
