<template>
  <!-- <div>
    <input
        style="max-width: 50px;"
        ref='dayInput'
        :class='[fieldsCustomClasses, dayErrorClasses]'
        :data-purpose="`${dataPurposeProp}_day_field`"
        :value='dayValue'
        name="day"
        max="31"
        min='0'
        pattern="[0-9]*"
        placeholder="day"
        type='number'
        @focus="$emit('focus')"
        @input="handleDay($event.target.value)"
        @keydown.backspace.prevent="erase('dayValue')"
    />
    <input
    style="max-width: 50px;"
        ref='monthInput'
        :class='[fieldsCustomClasses, monthErrorClasses]'
        :data-purpose="`${dataPurposeProp}_month_field`"
        :value='monthValue'
        inputmode="numeric"
        max='12'
        min='0'
        name="month"
        pattern="[0-9]*"
        placeholder="month"
        type='number'
        @focus="$emit('focus')"
        @input="handleMonth($event.target.value)"
        @keydown.backspace.prevent="erase('monthValue')"
    />
    <input
        style="max-width: 100px;"
        ref='yearInput'
        :class='[fieldsCustomClasses, yearErrorClasses]'
        :data-purpose="`${dataPurposeProp}_year_field`"
        :max="maxSupportedYear"
        :min="minSupportedYear"
        :value='yearValue'
        name="year"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder="year"
        type='number'
        @blur="$emit('blur'); dateError = this.computeDateError();"
        @input="handleYear($event.target.value)"
        @focus="$emit('focus')"
        @keydown.backspace.prevent="erase('yearValue')"
    />
  </div> -->

    <!-- onfocus="this.showPicker()" -->

    <input autofocus type="date" id="date-input" name="date-input" :value="date"  :min="minDate" :max="maxDate" placeholder="dd-mm-yyyy">
</template>

<script>
export default {
  //NOte THIS IS DUMMY DateInput COMPONENT so that I can test the date input field MA 02/28/2023
  name: 'DateInput',
  props: [
    'value', //date value
    'showCalByDeflt',  //if true show dropdown calender by default
    'maxDate', //max date allowed
    'minDate', //min date allowed
  ],
  data () {
    return {
      dayDataPurpose: null,
      dayError: false,
      dayValue: null,
      dateError: false,
      monthDataPurpose: null,
      monthError: false,
      monthValue: null,
      yearDataPurpose: null,
      yearError: false,
      yearValue: null,
      yearKey: 0,
      maxSupportedYear: 2100,
      minSupportedYear: 1900,
      minDayOrMonthValueForLoop: '01',
      minDayOrMonthValueForMarginBound: 0,
      minDayOrMonthValue: 1,
      maxDayValue: 31,
      maxMonthValue: 12,
      digitsInYear: 4,
      digitsInDayOrMonth: 2,
      maxDayOrMonthLength: 3,
      maxDayNumberWithPossibleSecondDigit: 3,
      maxMonthNumberWithPossibleSecondDigit: 1,
      highestThreeDigitNumber: 999,
    };
  },
  computed: {
    date () {
     return this.fullDate ? `${this.yearValue}-${this.monthValue}-${this.dayValue}` : null;
    },
    dayErrorClasses () {
      console.log(this.dateError)
      return this.dayError || this.dateError ? `${this.fieldsErrorClasses} error`: '';
    },
    monthErrorClasses () {
      console.log(this.dateError)
      return this.monthError || this.dateError ? `${this.fieldsErrorClasses} error`: '';
    },
    yearErrorClasses () {
      console.log(this.dateError)
      return this.yearError || this.dateError ? `${this.fieldsErrorClasses} error`: '';
    },
    fullDate () {
      return this.dayValue && this.monthValue && this.yearValue
    },
  },
  watch: {
    value: {
      immediate: true,
      handler () {
        if (this.value) {
          const splitDate = this.value.split('-');
          this.dayValue = splitDate[2] ;
          this.monthValue = splitDate[1];
          this.yearValue = splitDate[0];
        }
      },
    },
    date: {
      immediate: true,
      handler () {
        if (this.date) {
          this.$emit('input', this.date);
        }
      },
    },
  },
  methods: {
    computeDateError () {
      try {
        const date = new Date(this.date)
        return date.getDate() !== parseInt(this.dayValue)
      } catch {
        return true
      }
    },
    incrementDay (key) {
      let value = this.dayValue;
      key === 'ArrowDown' ? value-- : value++;
      this.dayValue = this.formattedValue(this.loop(value, this.maxDayValue));
    },
    incrementMonth (key) {
      let value = this.monthValue;
      key === 'ArrowDown' ? value-- : value++;
      this.monthValue = this.formattedValue(this.loop(value, this.maxMonthValue));
    },
    incrementYear (key) {
      let value = this.yearValue;
      key === 'ArrowDown' ? value-- : value++;
      this.yearValue = this.formattedValue(this.loop(value, this.maxSupportedYear, this.minSupportedYear), this.digitsInYear);
    },
    handleDay (value) {
      this.dayError = false;
      if (value === '') return;
      value = this.marginBound(value, this.minDayOrMonthValueForMarginBound, this.maxDayValue);
      const passToNextField = parseInt(value) > this.maxDayNumberWithPossibleSecondDigit || value.length === this.maxDayOrMonthLength;
      this.dayValue = this.formattedValue(value);
      setTimeout(() =>  this.dayError = parseInt(this.dayValue) < this.minDayOrMonthValue || parseInt(this.dayValue) > this.maxDayValue, 500);
      if (passToNextField) this.$refs.monthInput.focus();
    },
    handleMonth (value) {
      this.monthError = false;
      if (value === '') return;
      value = this.marginBound(value, this.minDayOrMonthValueForMarginBound, this.maxMonthValue);
      const passToNextField = parseInt(value) > this.maxMonthNumberWithPossibleSecondDigit || value.length === this.maxDayOrMonthLength;
      this.monthValue = this.formattedValue(value);
      setTimeout(() =>  this.monthError = parseInt(this.monthError) < this.minDayOrMonthValue || parseInt(this.monthError) > this.maxMonthValue, 500);
      if (passToNextField) this.$refs.yearInput.focus();
    },
    handleYear (value) {
      this.yearValue = value;
      value = this.formattedValue(value, this.digitsInYear);
      this.yearValue = this.marginBound(value, '0000', '9999');
      this.yearError = this.yearValue > this.highestThreeDigitNumber && (parseInt(this.yearValue) > this.maxSupportedYear || parseInt(this.yearValue) < this.minSupportedYear);
    },
    erase (field) {
      this[field] = '';
    },
    loop (value, max, min = this.minDayOrMonthValueForLoop) {
      if (parseInt(value) > max) return min;
      if (parseInt(value) < min) return max;
      return value;
    },
    marginBound (value, lowerBound, upperBound) {
      if (parseInt(value).toString().length < upperBound.toString().length) return value;
      if (parseInt(value) > upperBound) return upperBound;
      if (parseInt(value) < lowerBound) return lowerBound;
      return value;
    },
    formattedValue (value, digits = this.digitsInDayOrMonth) {
      const stringValue = value.toString();
      const difference = stringValue.length - digits;
      if (difference > 0) return stringValue.slice(difference);
      return stringValue.padStart(digits, '0');
    },
  },
};
</script>

<style scoped>
  .error {
    background-color: red;
  }


  /* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>