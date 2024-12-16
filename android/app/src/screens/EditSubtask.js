import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditSubtask = ({ navigation, route }) => {
    const { title, subTaskId, subTask, onSubmit } = route.params;
    const [subtaskName, setSubtaskName] = useState(title);
    const [showDeadlineFields, setShowDeadlineFields] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const editSubtask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const taskId = await AsyncStorage.getItem('taskId');
      const assigneeId = await AsyncStorage.getItem('assigneeId');
      console.log(taskId, assigneeId);

      const response = await fetch(
        `http://172.20.10.2:3001/api/tasks/${taskId}/assignees/${assigneeId}/subtasks/${subTaskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: subtaskName,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Thành công', 'Subtask đã được sửa!');

        if (onSubmit) {
          onSubmit({...subTask, title: subtaskName});
        }

        navigation.goBack();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể sửa subtask');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi sửa subtask');
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Đầu Việc</Text>
        <TouchableOpacity style={styles.ellipsisButton}>
          <Icon name="ellipsis-v" size={30} />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{color: '#42A5F5', fontSize: 16, paddingHorizontal: 5}}>
          Nội dung công việc
        </Text>
        <TextInput
          style={styles.textInput}
          multiline={true}
          numberOfLines={5}
          placeholder="Nhập nội dung..."
          textAlignVertical="top"
          value={subtaskName}
          onChangeText={setSubtaskName}
        />
        <TouchableOpacity
          style={{alignItems: 'flex-end', paddingRight: 5}}
          onPress={() => setShowDeadlineFields(!showDeadlineFields)}>
          <Text style={{color: 'green'}}>+ Thêm Thời Hạn</Text>
        </TouchableOpacity>
        {showDeadlineFields && (
          <View style={styles.deadlineContainer}>
            <Text style={styles.label}>Thời Hạn Subtask</Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}>
                <Text>
                  {startDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
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
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={editSubtask}>
        <Text style={styles.addButtonText}>Sửa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
  header: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 8,
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 20,
  },
  ellipsisButton: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textInput: {
    borderRadius: 10,
    backgroundColor: '#eeeee4',
    fontSize: 16,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 0,
    backgroundColor: '#42A5F5',
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deadlineContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginVertical: 5,
  },
});

export default EditSubtask;
