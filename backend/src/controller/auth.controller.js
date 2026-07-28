import { registerUser, loginUser } from '../services/auth.service.js';
import wrapAsync from '../utils/tryCatchWrapper.js';
import { cookieOptions } from '../config/config.js';

export const register_user = wrapAsync(async (req, res) => {
    const { email, password, name } = req.body;
    const { user, token } = await registerUser(name, email, password);
    req.user = user;
    res.cookie("accesstoken", token, cookieOptions);
    res.status(200).json({ message: 'register success', user });
});

export const login_user = wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    req.user = user;
    res.cookie("accesstoken", token, cookieOptions);
    res.status(200).json({ user: user, message: "login success" });
});

export const logout_user = wrapAsync(async (req, res) => {
    res.clearCookie("accesstoken", cookieOptions);
    res.status(200).json({ message: "User logout success" });
});

export const get_current_user = wrapAsync(async (req, res) => {
    res.status(200).json({ user: req.user });
});
