import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "./message";
import AuthService, { RegisterFormData, LoginFormData } from "api/AuthAPI";
import UsersService, { UserProfileData, UserPasswordData } from "api/UsersAPI";

const user = localStorage.getItem("user") != undefined ? JSON.parse(localStorage.getItem("user") as string) : {};

const STATUS_TEXT = {
  'REG_SUCCESS': 'Вы зарегистрировались',
  'REG_ERROR': 'Ошибка регистрации',
  'LOGIN_SUCCESS': 'Вы авторизовались',
  'LOGIN_ERROR': 'Ошибка авторизации',
  'SUCCESS': 'Данные обновлены',
  'ERROR': 'Ошибка обновления',
};

export const register = createAsyncThunk(
  "base/register",
  async (data: RegisterFormData, thunkAPI) => {
    try {
      const getSignUp = await AuthService.signUp(data);
      if(getSignUp.id) {
        try {
          const getUserInfo = await AuthService.getUserInfo();
          localStorage.setItem("user", JSON.stringify(getUserInfo.data));
          return { user: getUserInfo.data };
        } catch (e) {
          await AuthService.logout();
          return thunkAPI.rejectWithValue(STATUS_TEXT.REG_ERROR);
        }
      }
      thunkAPI.dispatch(setMessage(STATUS_TEXT.REG_SUCCESS));
    } catch (error) {
      thunkAPI.dispatch(setMessage(STATUS_TEXT.REG_ERROR));
      return thunkAPI.rejectWithValue(STATUS_TEXT.REG_ERROR);
    }
  }
);

export const login = createAsyncThunk(
  "base/login",
  async (data: LoginFormData, thunkAPI) => {
    try {
      const response = await AuthService.signIn(data);
      if(response == 'OK') {
        const getUserInfo = await AuthService.getUserInfo();
        localStorage.setItem("user", JSON.stringify(getUserInfo.data));
        thunkAPI.dispatch(setMessage(STATUS_TEXT.LOGIN_SUCCESS));
        return { user: getUserInfo.data };
      }else{
        thunkAPI.dispatch(setMessage(STATUS_TEXT.LOGIN_ERROR));
        return thunkAPI.rejectWithValue(STATUS_TEXT.LOGIN_ERROR);
      }
    } catch (error) {
      thunkAPI.dispatch(setMessage(STATUS_TEXT.LOGIN_ERROR));
      return thunkAPI.rejectWithValue(STATUS_TEXT.LOGIN_ERROR);
    }
  }
);

export const logout = createAsyncThunk("base/logout", async () => {
  localStorage.removeItem("user");
  await AuthService.logout();
});

export const changeProfile = createAsyncThunk(
  "base/changeProfile",
  async (data: UserProfileData, thunkAPI) => {
    try {
      const infoChange = await UsersService.changeProfile(data);
      thunkAPI.dispatch(setMessage(STATUS_TEXT.SUCCESS));
      localStorage.setItem("user", JSON.stringify(infoChange));
      return { user: infoChange };
    } catch (error) {
      thunkAPI.dispatch(setMessage(STATUS_TEXT.ERROR));
      return thunkAPI.rejectWithValue(STATUS_TEXT.ERROR);
    }
  }
);

export const changeAvatar = createAsyncThunk(
  "base/changeAvatar",
  async (data: FormData, thunkAPI) => {
    try {
      const response = await UsersService.changeAvatar(data);
      if(response.avatar) {
        localStorage.setItem("user", JSON.stringify(response));
        return { user: response };
      }
    } catch (error) {
      thunkAPI.dispatch(setMessage(STATUS_TEXT.ERROR));
      return thunkAPI.rejectWithValue(STATUS_TEXT.ERROR);
    }
  }
);

export const changePassword = createAsyncThunk(
    "base/changePassword", 
    async (data: UserPasswordData) => {

  await UsersService.changePassword(data);
});

const initialState = Object.keys(user).length ? { isLoggedIn: true, user } : { isLoggedIn: false, user: null };

export type StateType<T> = {
  [key in string] : T
};

const baseSlice = createSlice({
  name: "base",
  initialState,
  reducers: {},
  extraReducers: {
    [register.fulfilled as any]: (state: StateType<boolean>, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    },
    [register.rejected as any]: (state: StateType<boolean>, action) => {
      state.isLoggedIn = false;
    },
    [login.fulfilled as any]: (state: StateType<boolean | null | number>, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.user;
    },
    [login.rejected as any]: (state: StateType<boolean | null>, action) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    [logout.fulfilled as any]: (state: StateType<boolean | null>, action) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    [logout.rejected as any]: (state: StateType<boolean | null>, action) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    [changeProfile.fulfilled as any]: (state: StateType<boolean>, action) => {
      state.user = action.payload.user;
    },
    [changeAvatar.fulfilled as any]: (state: StateType<boolean>, action) => {
      state.user = action.payload.user;
    }
  },
});

const { reducer } = baseSlice;
export default reducer;