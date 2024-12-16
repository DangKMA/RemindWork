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

const EditInfo = ({route, navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const {employee} = route.params;
  const [avatarUri, setAvatarUri] = useState(
    'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
  );
  const [avatar, setAvatar] = useState(
    'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
  );

  useEffect(() => {
    const fetchUserData = () => {
      if (employee) {
        setName(employee.name || '');
        setEmail(employee.email || '');
        setAvatar(
          employee.avatar.startsWith('http')
            ? employee.avatar
            : `http://172.20.10.2:3001/${employee.avatar.replace(/\\/g, '/')}`,
        );
      }
    };

    fetchUserData();
  }, [employee]);
  const selectImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    Alert.alert(
      'Chọn ảnh',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await launchCamera(options);
            console.log('Image URI:', result.assets[0].uri);
            if (!result.didCancel && !result.errorCode) {
              setAvatarUri(result.assets[0].uri);
              setAvatar(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Thư viện',
          onPress: async () => {
            const result = await launchImageLibrary(options);
            if (!result.didCancel && !result.errorCode) {
              setAvatarUri(result.assets[0].uri);
              setAvatar(result.assets[0].uri);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();

      if (avatarUri) {
        formData.append('avatar', {
          uri: avatarUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      }

      formData.append('name', name);

      const response = await fetch(
        `http://172.20.10.2:3001/api/users/change-information`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại.');
      }

      const data = await response.json();
      //   console.log('data', data.user.avatar);
      setAvatar(data.avatar);
      Alert.alert('Thông báo', 'Cập nhật thành công!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Thông Báo', 'Cập nhật không thành công, mời thực hiện lại ');
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
        <TouchableOpacity onPress={selectImage}>
          <Image
            source={{
              uri:
                avatar && avatar.startsWith('upload')
                  ? `http://172.20.10.2:3001/${avatarUri.replace(/\\/g, '/')}`
                  : avatar ||
                    'https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={selectImage}>
          <Text style={styles.profileName}>Đổi hình đại diện</Text>
        </TouchableOpacity>
        <View style={styles.profileDetail}>
          <Text style={styles.label}>Họ Tên</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
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
    paddingLeft: 10,
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

export default EditInfo;
