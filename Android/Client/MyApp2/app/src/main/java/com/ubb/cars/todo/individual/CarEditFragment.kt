package com.ilazar.myapp2.todo.car

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ubb.cars.core.TAG
import com.ubb.cars.databinding.FragmentCarEditBinding

class CarEditFragment : Fragment() {
    companion object {
        const val INDIVIDUAL_ID = "INDIVIDUAL_ID"
    }

    private lateinit var viewModel: CarEditViewModel
    private var carId: String? = null

    private var _binding: FragmentCarEditBinding? = null

    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        arguments?.let {
            if (it.containsKey(INDIVIDUAL_ID)) {
                carId = it.getString(INDIVIDUAL_ID).toString()
            }
        }
        _binding = FragmentCarEditBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")
        setupViewModel()
        binding.fab.setOnClickListener {
            Log.v(TAG, "save car")
            viewModel.saveOrUpdateCar(binding.carText.text.toString())
        }
        binding.carText.setText(carId)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
        Log.i(TAG, "onDestroyView")
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this).get(CarEditViewModel::class.java)
        viewModel.car.observe(viewLifecycleOwner, { car ->
            Log.v(TAG, "update cars")
            binding.carText.setText(car.text)
        })
        viewModel.fetching.observe(viewLifecycleOwner, { fetching ->
            Log.v(TAG, "update fetching")
            binding.progress.visibility = if (fetching) View.VISIBLE else View.GONE
        })
        viewModel.fetchingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.v(TAG, "update fetching error")
                val message = "Fetching exception ${exception.message}"
                val parentActivity = activity?.parent
                if (parentActivity != null) {
                    Toast.makeText(parentActivity, message, Toast.LENGTH_SHORT).show()
                }
            }
        })
        viewModel.completed.observe(viewLifecycleOwner, { completed ->
            if (completed) {
                Log.v(TAG, "completed, navigate back")
                findNavController().navigateUp()
            }
        })
        val id = carId
        if (id != null) {
            viewModel.loadCar(id)
        }
    }
}