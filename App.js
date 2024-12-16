import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './android/app/src/screens/LoginScreen';
import MainScreen from './android/app/src/screens/MainScreen';
import AddSchedule from './android/app/src/screens/AddSchedule';
import Schedule from './android/app/src/screens/Schedule';
import Users from './android/app/src/screens/Users';
import AddUsers from './android/app/src/screens/AddUsers';
import ProjectList from './android/app/src/screens/ProjectList';
import Detail from './android/app/src/screens/Detail';
import InviteUser from './android/app/src/screens/InviteUsers';
import Profile from './android/app/src/screens/Profile';
import AddSubtask from './android/app/src/screens/AddSubtask';
import EditSubtask from './android/app/src/screens/EditSubtask';
import EditProfile from './android/app/src/screens/EditProfile';
import Setting from './android/app/src/screens/Setting';
import EditInfo from './android/app/src/screens/EditInfo';
import History from './android/app/src/screens/History';
import ChangePassword from './android/app/src/screens/ChangePassword';
import AddProject from './android/app/src/screens/AddProject';
import EditProject from './android/app/src/screens/EditProject';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    const getToken = async () => {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp();
        } else {
          firebase.app(); // Nếu đã khởi tạo rồi, dùng ứng dụng đã khởi tạo
        }
        // Yêu cầu quyền nhận thông báo
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);

          // Lấy device token
          const token = await messaging().getToken();
          console.log('Device Token:', token);
        } else {
          console.log('Quyền nhận thông báo không được cấp');
        }
      } catch (error) {
        console.error('Lỗi khi lấy token:', error);
      }
    };

    getToken();
  }, []);

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     console.log('Notification received in foreground:', remoteMessage);
  //   });
  //   messaging().setBackgroundMessageHandler(async remoteMessage => {
  //     console.log('Notification received in background:', remoteMessage);
  //   });
  
  //   return unsubscribe;
  // }, []);

  // useEffect(() => {
  //   messaging()
  //     .getInitialNotification()
  //     .then(remoteMessage => {
  //       if (remoteMessage) {
  //         console.log('Notification caused app to open:', remoteMessage);
  //       }
  //     });
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddSchedule"
          component={AddSchedule}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Schedule"
          component={Schedule}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Users"
          component={Users}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddUsers"
          component={AddUsers}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProjectList"
          component={ProjectList}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Detail"
          component={Detail}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="InviteUsers"
          component={InviteUser}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddSubtask"
          component={AddSubtask}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditSubtask"
          component={EditSubtask}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditInfo"
          component={EditInfo}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={{headerShown: false}}
        />
                <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddProject"
          component={AddProject}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditProject"
          component={EditProject}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
