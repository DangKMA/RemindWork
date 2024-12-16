import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddProject = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const navigation = useNavigation();

  const handleContinue = async () => {
    if (title.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề công việc!');
    } else if (text.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung công việc!');
    } else {
      try {
        const storedProjectId = await AsyncStorage.getItem('projectId');
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://172.20.10.2:3001/api/projects', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title:title,
            description: text,
          }),
        });

        if (!response.ok) {
          throw new Error('Lưu dự án thất bại');
        }

        Alert.alert('Thông báo', 'Dự án đã được thêm thành công!');
        navigation.navigate('MainScreen');
      } catch (error) {
        Alert.alert('Thông báo', 'Có lỗi xảy ra. Vui lòng thử lại.');
        console.error(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{height: 55, flexDirection: 'row'}}>
        <TouchableOpacity
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Thêm Dự Án</Text>
        <TouchableOpacity style={styles.iconButton}
        onPress={()=> navigation.navigate('Schedule')}>
          <Icon name="calendar" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}
        onPress={()=> navigation.navigate('MainScreen')}>
          <Icon name="home" size={30} />
        </TouchableOpacity>
      </View>

      <View style={{height: '85%'}}>
        <Text style={{color: 'orange', fontSize: 16, paddingHorizontal: 5}}>
          Tiêu đề công việc
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tiêu đề..."
          value={title}
          onChangeText={setTitle}
        />

        <Text style={{color: 'orange', fontSize: 16, paddingHorizontal: 5}}>
          Nội dung công việc
        </Text>
        <TextInput
          style={styles.textInput}
          multiline={true}
          numberOfLines={5}
          placeholder="Nhập nội dung..."
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
        />
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={{color: 'white', fontSize: 18}}>TIẾP TỤC</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    flex: 7,
    alignItems: 'center',
    fontSize: 20,
    textAlignVertical: 'center',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#eeeee4',
    fontSize: 16,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  continueButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    backgroundColor: '#42A5F5',
  },
});

export default AddProject;
