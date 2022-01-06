package com.ilazar.myapp2.todo.car

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ubb.cars.car.data.CarRepository
import com.ubb.cars.core.TAG
import com.ubb.cars.core.Result
import com.ubb.cars.car.data.Car
import kotlinx.coroutines.launch

class CarEditViewModel : ViewModel() {
    private val mutableCar = MutableLiveData<Car>().apply { value = Car("", "") }
    private val mutableFetching = MutableLiveData<Boolean>().apply { value = false }
    private val mutableCompleted = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val car: LiveData<Car> = mutableCar
    val fetching: LiveData<Boolean> = mutableFetching
    val fetchingError: LiveData<Exception> = mutableException
    val completed: LiveData<Boolean> = mutableCompleted

    fun loadCar(carId: String) {
        viewModelScope.launch {
            Log.i(TAG, "loadCar...")
            mutableFetching.value = true
            mutableException.value = null
            when (val result = CarRepository.load(carId)) {
                is Result.Success -> {
                    Log.d(TAG, "loadCar succeeded");
                    mutableCar.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadCar failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableFetching.value = false
        }
    }

    fun saveOrUpdateCar(text: String) {
        viewModelScope.launch {
            Log.v(TAG, "saveOrUpdateCar...");
            val car = mutableCar.value ?: return@launch
            car.text = text
            mutableFetching.value = true
            mutableException.value = null
            val result: Result<Car>
            if (car._id.isNotEmpty()) {
                result = CarRepository.update(car)
            } else {
                val charPool : List<Char> = ('a'..'z') + ('A'..'Z') + ('0'..'9')
                val randomString = (1..8)
                    .map { i -> kotlin.random.Random.nextInt(0, charPool.size) }
                    .map(charPool::get)
                    .joinToString("");

                car._id = randomString
                result = CarRepository.save(car)
            }
            when (result) {
                is Result.Success -> {
                    Log.d(TAG, "saveOrUpdateCar succeeded");
                    mutableCar.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "saveOrUpdateCar failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableCompleted.value = true
            mutableFetching.value = false
        }
    }
}
