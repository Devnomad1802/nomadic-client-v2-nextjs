"use client";

import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export const MyImage = ({ image }) => (
  <LazyLoadImage
    alt={image.alt}
    effect="blur"
    src={image}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />
);
