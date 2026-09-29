import sys
import json
import re

def main():
    input_data = sys.stdin.read()
    if not input_data:
        print(json.dumps({"error": "No input data provided"}))
        return

    try:
        data = json.loads(input_data)
        user_interests = [i.lower() for i in data.get("userInterests", [])]
        courses = data.get("courses", [])
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return

    results = []

    for course in courses:
        score = 0
        reasons = []

        # Tag matching (interest overlap)
        course_tags = [t.lower() for t in course.get("tags", [])]
        matching_tags = []
        for tag in course_tags:
            for interest in user_interests:
                if tag in interest or interest in tag:
                    matching_tags.append(tag)
                    break
        
        if matching_tags:
            score += len(matching_tags) * 3
            reasons.append(f"Matches interests: {', '.join(matching_tags)}")

        # Category matching
        category = course.get("category", "").lower()
        category_match = False
        for interest in user_interests:
            if category in interest or interest in category:
                category_match = True
                break
        
        if category_match:
            score += 2
            reasons.append(f"Related category: {course.get('category')}")

        # Popularity boost
        enrollments = course.get("_count", {}).get("enrollments", 0)
        if enrollments > 10:
            score += 1
            reasons.append("Popular course")

        # Title keyword matching
        title = course.get("title", "").lower()
        title_words = re.split(r'\s+', title)
        title_matches = []
        for word in title_words:
            for interest in user_interests:
                if word in interest or interest in word:
                    title_matches.append(word)
                    break
        
        if title_matches:
            score += len(title_matches) * 2

        # Include prior ratings impact if available
        # Assuming course['rating'] is an aggregate rating
        rating = course.get("rating")
        if rating and rating >= 4.0:
            score += 1
            reasons.append("Highly rated by users")

        if score > 0:
            results.append({
                "courseId": course.get("id"),
                "score": score,
                "reason": "; ".join(reasons) or "Explore something new"
            })

    # Sort by score descending and take top 5
    results.sort(key=lambda x: x["score"], reverse=True)
    top_5 = results[:5]

    output = {
        "algorithmVersion": "v2_python",
        "recommendations": top_5
    }

    print(json.dumps(output))

if __name__ == "__main__":
    main()
