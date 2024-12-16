import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import FeatherIcon from 'react-native-vector-icons/Feather';

const Setting = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(
            'http://172.20.10.2:3001/api/users/information',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error('Lỗi khi tải thông tin người dùng');
          }

          const userData = await response.json();
          setName(userData.name);
          setEmail(userData.email);
          setAvatar(userData.avatar);
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu người dùng:', error);
          Alert.alert('Thông báo', 'Không thể tải thông tin người dùng');
        } finally {
          setLoading(false);
        }
      } 
    };

    fetchUserData();
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('token');
    Alert.alert('Thông báo', 'Đăng xuất thành công');
    navigation.replace('Login');
  };

  if (loading) {
    return <Text>Đang tải dữ liệu...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={{height: 50, flexDirection: 'row'}}>
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20}></Icon>
        </TouchableOpacity>
        <Text
          style={{
            flex: 8,
            alignItems: 'center',
            fontSize: 20,
            textAlignVertical: 'center',
            fontWeight: 'bold',
          }}>
          Cài Đặt
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Image
          source={{
            uri:
              `http://172.20.10.2:3001/${avatar.replace(/\\/g, '/')}` ||
              'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
          }}
          style={styles.avatarImg}
        />
        <View>
          <Text style={styles.nameText}>{name}</Text>
          <Text>{email}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.title}>CÁ NHÂN</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            navigation.navigate('EditInfo', {
              employee: {name, email, avatar},
            })
          }>
          <FeatherIcon name="unlock" size={16} color="#007BFF" />
          <Text style={{fontSize: 16}}>Thông tin tài khoản</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('ChangePassword')}>
          <FeatherIcon name="edit" size={16} color="#007BFF" />
          <Text style={{fontSize: 16}}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <FeatherIcon name="log-out" size={16} color="#007BFF" />
          <Text style={{fontSize: 16}}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          paddingVertical: 10,
        }}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MainScreen')}>
          <Icon name="home" size={25} color="#000" />
          <Text>Trang Chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ProjectList')}>
          <Icon name="tasks" size={25} color="#000" />
          <Text>Công Việc</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => navigation.navigate('AddSchedule')}>
          <FontistoIcon name="plus-a" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Users')}>
          <Icon name="users" size={25} color="#000" />
          <Text>Nhân Sự</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="cog" size={25} color="#000" />
          <Text>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 40,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
  },
  nameText: {
    fontSize: 24,
    color: '#42A5F5',
  },
  title: {
    marginBottom: 5,
    fontSize: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#EEEEEE',
  },
  detail: {
    paddingLeft: 20,
    marginBottom: 5,
    borderColor: '#EEEEEE',
    borderBottomWidth: 1,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    width: '100%',
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  navButton: {
    height: 'auto',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    marginBottom: 10,
    height: '130%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    backgroundColor: '#42A5F5',
  },
});

export default Setting;
