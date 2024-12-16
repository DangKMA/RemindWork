import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfile = ({route, navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const {employee} = route.params;
  const [avatarUri, setAvatarUri] = useState(
    'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
  );

  useEffect(() => {
    const fetchUserData = () => {
      if (employee) {
        setName(employee.name || '');
        setEmail(employee.email || '');
        setPhone(employee.phone || '');
        setAddress(employee.address || '');
        setRole(employee.role || '');
        setAvatarUri(
            employee.avatar.startsWith('http')
              ? employee.avatar
              : `http://172.20.10.2:3001/${employee.avatar.replace(/\\/g, '/')}`,
          );
      }
    };

    fetchUserData();
  }, [employee]);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const projectId = await AsyncStorage.getItem('selectedProjectId');
      const userId = employee._id;
      console.log(projectId);
      console.log(userId);

      const response = await fetch(
        `http://172.20.10.2:3001/api/projects/${projectId}/members/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: role,
          }),
        },
      );
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại.');
      }
      const data = await response.json();

      Alert.alert('Thông báo', 'Cập nhật thành công!');
      navigation.navigate('Users');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi cập nhật.');
    }
  };

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
          Nhân Sự
        </Text>
      </View>

      <View style={styles.profileContainer}>
        <Image
          source={{
            uri:
              avatarUri ||
              'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
          }}
          style={styles.profileImage}
        />


        <View style={styles.profileDetail}>
          <Text style={styles.label}>Họ Tên</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            editable={false}
          />
        </View>
        <View style={styles.profileDetail}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={false}
          />
        </View>

        <View style={styles.profileDetail}>
          <Text style={styles.label}>Vai Trò</Text>
          <TextInput style={styles.input} value={role} onChangeText={setRole} />
        </View>
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
    marginBottom: 20,
  },
  profileDetail: {
    paddingLeft:10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  label: {
    width: 80,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    justifyContent: 'flex-end',
    backgroundColor: '#007BFF',
    padding: 15,

    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;
