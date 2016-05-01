package com.jeff_fennell.capstone;

import com.cloudinary.Cloudinary;
import java.util.HashMap;
import java.util.Map;

public class CloudinaryManager {
    public static final String CLOUDINARY_CLOUD_NAME = "sdfjgh87sdflkghsdflgsd3453a";
    public static final String CLOUDINARY_SECRET_KEY = "HqCX5qM4sUbIfxKcBG2p5LeqAXc";
    public static final String CLOUDINARY_API_KEY = "256281581596335";

    public static Cloudinary getInstance() {
        Map config = new HashMap();
        config.put("cloud_name", CLOUDINARY_CLOUD_NAME);
        Cloudinary mobileCloudinary = new Cloudinary(config);
        return mobileCloudinary;
    }
}
