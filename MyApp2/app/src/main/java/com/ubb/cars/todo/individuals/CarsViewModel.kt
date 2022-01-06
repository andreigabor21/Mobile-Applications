package com.ilazar.myapp2.todo.cars

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ubb.cars.todo.data.CarRepository
import com.ubb.cars.core.TAG
import com.ubb.cars.core.Result
import com.ubb.cars.todo.data.Car
import kotlinx.coroutines.launch

class CarListViewModel : ViewModel() {
    private val mutableCars = MutableLiveData<List<Car>>().apply { value = emptyList() }
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val cars: LiveData<List<Car>> = mutableCars
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    fun createCar(position: Int): Unit {
        val list = mutableListOf<Car>()
        list.addAll(mutableCars.value!!)
        list.add(Car(position.toString(), "Car " + position))
        mutableCars.value = list
    }

    fun loadCars() {
        viewModelScope.launch {
            Log.v(TAG, "loadCars...");
            mutableLoading.value = true
            mutableException.value = null
            when (val result = CarRepository.loadAll()) {
                is Result.Success -> {
                    Log.d(TAG, "loadCars succeeded");
                    mutableCars.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadCars failed", result.exception);
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}
