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
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddSchedule = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [showDeadlineFields, setShowDeadlineFields] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const navigation = useNavigation();

  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  const onChangeStartTime = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(false);
    setStartTime(currentTime);
  };

  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  const onChangeEndTime = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(false);
    setEndTime(currentTime);
  };

  const handleContinue = async () => {
    console.log("HEllo");
    
    if (title.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập tiêu đề công việc!');
    } else if (text.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung công việc!');
    } else {
      try {
        const storedProjectId = await AsyncStorage.getItem('projectId');
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://172.20.10.2:3001/api/tasks', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description: text,
            projectId: storedProjectId,
            startDate: startDate.toISOString(),
            startTime: startTime.toISOString(),
            endDate: endDate.toISOString(),
            endTime: endTime.toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('Lưu công việc thất bại');
        }

        Alert.alert('Thông báo', 'Công việc đã được lưu thành công!');
        navigation.navigate('ProjectList');
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
        <Text style={styles.title}>Thêm Công Việc</Text>
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
        <TouchableOpacity
          style={{alignItems: 'flex-end', paddingRight: 5}}
          onPress={() => setShowDeadlineFields(!showDeadlineFields)}>
          <Text style={{color: 'green'}}>+ Thêm Thời Hạn</Text>
        </TouchableOpacity>

        {showDeadlineFields && (
          <>
            <View style={styles.deadlineContainer}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}>
                <Text>
                  {startDate.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartTimePicker(true)}>
                <Text>
                  {startTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={onChangeStartDate}
                />
              )}

              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={onChangeStartTime}
                />
              )}
            </View>

            <View style={styles.deadlineContainer}>
              <Text style={styles.label}>Ngày hết hạn</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}>
                <Text>
                  {endDate.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndTimePicker(true)}>
                <Text>
                  {endTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={onChangeEndDate}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={onChangeEndTime}
                />
              )}
            </View>
          </>
        )}
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
  deadlineContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: '#42A5F5',
    paddingTop: 5,
    paddingHorizontal: 5,
    marginVertical: 5,
  },
  dateButton: {
    margin: 10,
    width: 'auto',
    borderWidth: 1,
    backgroundColor: '#eeeeee',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
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

export default AddSchedule;
