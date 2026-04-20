import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  course: {
    marginBottom: 6,
    padding: 6,
    borderBottom: '1 solid #ccc',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

function formatTimeRange(time) {
  if (!time) return 'TBA';

  const startHour = time.hour;
  const startMinute = time.minute;

  const startTotal = startHour * 60 + startMinute;
  const endTotal = startTotal + time.minutesLong;

  const endHour = Math.floor(endTotal / 60) % 24;
  const endMinute = endTotal % 60;

  const format = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${ampm}`;
  };

  return `${format(startHour, startMinute)} - ${format(endHour, endMinute)}`;
}

const SchedulePDF = ({ schedule }) => {
  const courses = schedule?.courses || [];

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Weekly Schedule</Text>
        <Text style={styles.subtitle}>
          {courses.length} courses • {schedule.totalCredits || 0} credits
        </Text>

        {courses.map((course) => (
          <View key={course.referenceNumber} style={styles.course}>
            <Text>
              {course.department} {course.code}{course.section ? `-${course.section}` : ''}
            </Text>

            <Text>
              Professor: {course.professorNames?.join(', ') || 'TBA'}
            </Text>

            {course.meetingTimes?.map((t, i) => (
              <Text key={i}>
                {t.day}: {formatTimeRange(t)}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default SchedulePDF;