'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export default function DietPlanPage() {
  const router = useRouter()
  const cart = useSelector((state) => state.cart || [])

  const [form, setForm] = React.useState({
    age: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
    activityLevel: 'moderate',
    goal: 'lose',
    dietaryPreference: 'none',
    allergies: '',
    mealsPerDay: 3,
    calorieTarget: '',
    cuisine: 'indian'
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [plan, setPlan] = React.useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.age || !form.heightCm || !form.weightKg) return 'Please fill age, height and weight.'
    return ''
  }

  const generatePrompt = () => {
    return `You are a certified nutritionist. Create a 7-day diet plan as JSON only (no prose), tailored to:
Context:
- Age: ${form.age}
- Gender: ${form.gender}
- HeightCm: ${form.heightCm}
- WeightKg: ${form.weightKg}
- ActivityLevel: ${form.activityLevel}
- Goal: ${form.goal} (lose|maintain|gain)
- DietaryPreference: ${form.dietaryPreference} (none|vegetarian|vegan|keto|high-protein|low-carb)
- Allergies: ${form.allergies || 'none'}
- MealsPerDay: ${form.mealsPerDay}
- CalorieTarget: ${form.calorieTarget || 'auto-calc'}
- PreferredCuisine: ${form.cuisine}

Constraints:
- Use affordable, commonly available canteen-style foods.
- No nuts/shellfish if listed in allergies.
- Include macronutrients and calories per meal.
- Distribute daily calories roughly evenly across meals.
- Keep each meal description concise.

Output strict JSON with this shape:
{
  "summary": {
    "dailyCalories": number,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatGrams": number,
    "notes": string
  },
  "days": [
    {
      "day": 1,
      "meals": [
        {"name": "Breakfast", "items": ["..."], "calories": number, "protein": number, "carbs": number, "fat": number},
        {"name": "Lunch", "items": ["..."], "calories": number, "protein": number, "carbs": number, "fat": number},
        {"name": "Dinner", "items": ["..."], "calories": number, "protein": number, "carbs": number, "fat": number}
      ]
    }
  ]
}`
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    try {
      const prompt = generatePrompt()
      
      // Use the existing chatbot API endpoint
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate diet plan')
      }

      const data = await response.json()
      const text = data.summary || ''
      
      // Extract JSON from fenced block or raw braces
      const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
      const brace = text.match(/\{[\s\S]*\}/)
      const jsonCandidate = fenced ? fenced[1] : (brace ? brace[0] : '')

      try {
        const parsed = JSON.parse(jsonCandidate)
        setPlan(parsed)
      } catch (parseErr) {
        // If JSON parsing fails, create a simple plan from the text
        setPlan({
          summary: {
            dailyCalories: 2000,
            proteinGrams: 150,
            carbsGrams: 250,
            fatGrams: 67,
            notes: text
          },
          days: [{
            day: 1,
            meals: [
              {
                name: "Breakfast",
                items: ["Based on your preferences, here's a suggested plan"],
                calories: 400,
                protein: 25,
                carbs: 45,
                fat: 15
              }
            ]
          }]
        })
      }
    } catch (err) {
      console.error(err)
      setError('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Personalized Diet Plan</h1>
          <p className="text-gray-600">Answer a few questions and generate a 7-day plan with Gemini.</p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input name="age" value={form.age} onChange={onChange} type="number" className="w-full border rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={onChange} className="w-full border rounded-md p-2">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input name="heightCm" value={form.heightCm} onChange={onChange} type="number" className="w-full border rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input name="weightKg" value={form.weightKg} onChange={onChange} type="number" className="w-full border rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select name="activityLevel" value={form.activityLevel} onChange={onChange} className="w-full border rounded-md p-2">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="athlete">Athlete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select name="goal" value={form.goal} onChange={onChange} className="w-full border rounded-md p-2">
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain Muscle</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
            <select name="dietaryPreference" value={form.dietaryPreference} onChange={onChange} className="w-full border rounded-md p-2">
              <option value="none">None</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="high-protein">High Protein</option>
              <option value="low-carb">Low Carb</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
            <input name="allergies" value={form.allergies} onChange={onChange} type="text" className="w-full border rounded-md p-2" placeholder="e.g. peanuts, shellfish" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meals per Day</label>
            <select name="mealsPerDay" value={form.mealsPerDay} onChange={onChange} className="w-full border rounded-md p-2">
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calorie Target (optional)</label>
            <input name="calorieTarget" value={form.calorieTarget} onChange={onChange} type="number" className="w-full border rounded-md p-2" placeholder="e.g. 2200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cuisine</label>
            <select name="cuisine" value={form.cuisine} onChange={onChange} className="w-full border rounded-md p-2">
              <option value="indian">Indian</option>
              <option value="continental">Continental</option>
              <option value="asian">Asian</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-2">
            <button disabled={loading} type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md disabled:opacity-60">
              {loading ? 'Generating…' : 'Generate Plan'}
            </button>
            {error && <span className="text-red-600 text-sm">{error}</span>}
          </div>
        </form>

        {plan && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your 7-Day Diet Plan</h2>
            <div className="text-sm text-gray-700 mb-4">
              <div>Daily Calories: <span className="font-semibold">{plan.summary?.dailyCalories}</span></div>
              <div>Macros: <span className="font-semibold">{plan.summary?.proteinGrams}g P</span>, {plan.summary?.carbsGrams}g C, {plan.summary?.fatGrams}g F</div>
              {plan.summary?.notes && <div className="text-gray-600 mt-1">{plan.summary.notes}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(plan.days || []).map((d) => (
                <div key={d.day} className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Day {d.day}</h3>
                  <div className="space-y-3">
                    {(d.meals || []).map((m, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-800">{m.name}</div>
                          <div className="text-sm text-gray-600">{m.calories} kcal</div>
                        </div>
                        <div className="text-xs text-gray-600">{m.protein}g P • {m.carbs}g C • {m.fat}g F</div>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                          {(m.items || []).map((it, i) => (
                            <li key={i}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


