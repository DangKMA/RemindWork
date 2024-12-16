import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NHAN_SU = 'NHAN_SU';
const BO_PHAN = 'BO_PHAN';

const Users = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(NHAN_SU);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchEmployees = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const loggedInEmail = await AsyncStorage.getItem('email');
      const storedProjectId = await AsyncStorage.getItem('selectedProjectId');
      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${storedProjectId}`,
        {
          method: 'GET',
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const data = await response.json();
      if (data && Array.isArray(data.members)) {
        const users = data.members
          .map(member => {
            if (member.user) {
              if (
                member.role === 'admin' &&
                member.user.email === loggedInEmail
              ) {
                setIsAdmin(true);
              }
              return {...member.user, role: member.role, status: member.status};
            }
            return null;
          })
          .filter(user => user !== null);
        setEmployees(users);
        setSelectedProjectName(data.title);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };
  const saveUserId = async userId => {
    try {
      await AsyncStorage.setItem('selectedUserId', userId);
    } catch (error) {
      console.error('Error saving user ID:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    console.log(isAdmin);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{flex: 1}}>
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
          Nhân Sự
        </Text>

      </View>
      <View style={{padding: 10, alignItems: 'center'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>
          Dự án: {selectedProjectName}
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            height: 50,
            flex: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            setPage(NHAN_SU);
          }}>
          <Text style={{fontWeight: 'bold'}}>NHÂN SỰ</Text>
          {page === NHAN_SU ? (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                height: 3,
                width: '100%',
                backgroundColor: '#42A5F5',
              }}></View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 50,
            flex: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            setPage(BO_PHAN);
          }}>
          <Text style={{fontWeight: 'bold'}}>CÁC BỘ PHẬN</Text>
          {page === BO_PHAN ? (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                height: 3,
                width: '100%',
                backgroundColor: 'blue',
              }}></View>
          ) : null}
        </TouchableOpacity>
      </View>
      <ScrollView>
        {page === NHAN_SU &&
          (loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            employees.map(employee => (
              <View key={employee._id} style={styles.userInfoContainer}>
                <TouchableOpacity
                  key={employee._id}
                  style={styles.userInfoContainer}
                  onPress={() => {
                    saveUserId(employee._id);
                    navigation.navigate('Profile', {employee, isAdmin});
                    console.log(employee._id);
                  }}>
                  <Image
                    source={{
                      uri:
                        employee.avatar && employee.avatar.startsWith('upload')
                          ? `http://172.20.10.2:3001/${employee.avatar.replace(
                              /\\/g,
                              '/',
                            )}`
                          : employee.avatar ||
                            'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.userEmail}>{employee.email}</Text>
                    <Text style={styles.userRole}>
                      Vai trò: {employee.role}
                    </Text>
                  </View>
                  <View style={styles.statusDotContainer}>
                    <Text>Trạng Thái:</Text>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            employee.status === 'accepted' ? 'green' : 'red',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))
          ))}
      </ScrollView>
      {page === NHAN_SU && isAdmin ? (
        <View
          style={{
            width: '40%',
            paddingHorizontal: 10,
            paddingBottom: 20,
            marginLeft: '55%',
          }}>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => navigation.navigate('InviteUsers')}>
            <Icon name="user-plus" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Mời Nhân Sự</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MainScreen')}>
          <Icon name="home" size={25} color="#424242" />
          <Text>Trang Chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ProjectList')}>
          <Icon name="tasks" size={25} color="#424242" />
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
          <Icon name="users" size={25} color="#424242" />
          <Text>Nhân Sự</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}
        onPress={() => navigation.navigate('Setting')}>
          <Icon name="cog" size={25} color="#424242" />
          <Text>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 5,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight:10,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontWeight: 'bold',
  },
  statusDotContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  navButton: {
    height: 'auto',
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    marginBottom: 10,
    height: '120%',
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    backgroundColor: '#42A5F5',
  },
  inviteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#42A5F5',
    padding: 10,
    borderRadius: 20,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Users;
