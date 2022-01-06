package com.ilazar.myapp2.todo.cars

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ubb.cars.R
import com.ubb.cars.auth.data.AuthRepository
import com.ubb.cars.core.TAG
import com.ubb.cars.databinding.FragmentCarListBinding

class CarListFragment : Fragment() {
    private var _binding: FragmentCarListBinding? = null
    private lateinit var carListAdapter: CarListAdapter
    private lateinit var carsModel: CarListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        _binding = FragmentCarListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return;
        }
        setupCarList()
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new car")
            findNavController().navigate(R.id.CarEditFragment)
        }
    }

    private fun setupCarList() {
        carListAdapter = CarListAdapter(this)
        binding.carList.adapter = carListAdapter
        carsModel = ViewModelProvider(this).get(CarListViewModel::class.java)
        carsModel.cars.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update cars")
            carListAdapter.cars = value
        })
        carsModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })
        carsModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })
        carsModel.loadCars()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }
}